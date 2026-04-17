from fastapi import HTTPException, status
from sqlalchemy.orm import Query

from app.models.my_model import User, House, PointsLog


# =========================================================
# HELPERS
# =========================================================

def require_teacher_or_admin(user: User):
    """
    Allow teachers and admin role
    """
    if user.role not in ("teacher", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher only action"
        )

def require_admin(user: User):
    """
    Allow only admin
    """
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin only action"
        )


def require_auth(user: User):
    """
    Basic safety check (optional but useful)
    """
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )


# =========================================================
# HOUSE & PointsLog ACCESS CONTROL (CORE LOGIC)
# =========================================================

def apply_house_access(
    query: Query,
    user: User,
    house_id: int | None = None
) -> Query:

    # ---------------- Teacher / Admin ----------------
    if user.role in ["teacher", "admin"]:
        return query

    # ---------------- Student ----------------
    if user.role == "student":

        if not user.house_id:
            raise HTTPException(
                status_code=403,
                detail="Student not assigned to a house"
            )

        # If requesting a specific house
        if house_id is not None:
            if user.house_id != house_id:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied to this house"
                )

            return query.filter(House.id == user.house_id)

        # If listing → restrict to own house
        return query.filter(House.id == user.house_id)

    # ---------------- Unknown Role ----------------
    raise HTTPException(
        status_code=403,
        detail="Invalid role"
    )

def apply_points_access(query, user: User):
    """
    Role-based access for points logs.
    """

    # ---------------- Teacher / Admin ----------------
    if user.role in ["teacher", "admin"]:
        return query

    # ---------------- Student ----------------
    if user.role == "student":

        if not user.house_id:
            raise HTTPException(status_code=403, detail="No house assigned")

        return query.filter(PointsLog.house_id == user.house_id)

    raise HTTPException(status_code=403, detail="Invalid role")

# =========================================================
# FUTURE EXTENSION HELPERS (for treasure hunts, etc.)
# =========================================================

def can_access_school_resource(user: User, school_id: int):
    """
    Optional helper for future multi-school expansion
    """
    if user.school_id != school_id:
        raise HTTPException(
            status_code=403,
            detail="Cross-school access denied"
        )


def is_teacher(user: User) -> bool:
    return user.role == "teacher"


def is_student(user: User) -> bool:
    return user.role == "student"