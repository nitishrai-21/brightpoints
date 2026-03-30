# backend/app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.api.deps import get_db, get_current_user
from app.models.my_model import School, User, RefreshToken
from app.core.security import create_access_token
from app.schemas.user import RefreshRequest, UpdateProfileRequest
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------- ENV CONFIG ----------------
FRONTEND_URL = settings.FRONTEND_URL
BACKEND_URL = settings.BACKEND_URL


def generate_display_name(email: str) -> str:
    local = email.split("@")[0]
    parts = local.replace("_", ".").replace("-", ".").split(".")
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return local[:2].upper()


# ---------------- SSO Redirect ----------------
@router.get("/sso/{school_id}")
def sso_redirect(school_id: int, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    redirect_uri = f"{BACKEND_URL}/auth/callback"

    if school.client_id:
        google_auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={school.client_id}&response_type=code"
            f"&scope=openid email profile"
            f"&redirect_uri={redirect_uri}"
            f"&state={school.id}"
        )
        return RedirectResponse(google_auth_url)
    else:
        ad_login_url = f"https://{school.domain}/ad-login?redirect={redirect_uri}&state={school.id}"
        return RedirectResponse(ad_login_url)


# ---------------- SSO Callback ----------------
@router.get("/callback")
def sso_callback(code: str = None, state: int = None, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == state).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    if school.client_id:
        # Google OAuth
        token_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": school.client_id,
                "client_secret": school.client_secret,
                "redirect_uri": f"{BACKEND_URL}/auth/callback",
                "grant_type": "authorization_code",
            },
        ).json()

        idinfo = id_token.verify_oauth2_token(
            token_res["id_token"], google_requests.Request(), school.client_id, clock_skew_in_seconds=60
        )
        email = idinfo["email"]
    else:
        # Mock AD/SAML login
        email = f"user@{school.domain}"

    name = generate_display_name(email)

    # ✅ Tenant-safe: always associate user with their school
    user = db.query(User).filter(User.email == email, User.school_id == school.id).first()
    if not user:
        user = User(email=email, name=name, school_id=school.id, role="student")
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        {"sub": user.email, "role": user.role, "school_id": school.id}
    )

    refresh_token_str = str(uuid4())
    refresh_token = RefreshToken(user_id=user.id, token=refresh_token_str)
    db.add(refresh_token)
    db.commit()

    frontend_redirect = f"{FRONTEND_URL}/login-success?access_token={access_token}&refresh_token={refresh_token_str}"
    return RedirectResponse(frontend_redirect)


# ---------------- Current User Info ----------------
@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "school_id": current_user.school_id,
    }


# ---------------- Update Profile ----------------
@router.put("/me")
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    display_name = data.display_name.strip()
    if not display_name:
        raise HTTPException(status_code=400, detail="Display name cannot be empty")

    current_user.name = display_name
    db.commit()
    return {"message": "Profile updated", "name": current_user.name}


# ---------------- Refresh Token ----------------
@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    token_str = data.refresh_token
    token = db.query(RefreshToken).filter(RefreshToken.token == token_str).first()
    if not token or token.revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == token.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(
        {"sub": user.email, "role": user.role, "school_id": user.school_id}
    )

    new_refresh_token = str(uuid4())
    token.token = new_refresh_token
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
    }