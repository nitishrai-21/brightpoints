#app/api/routes/houses.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.api.deps import get_db, get_current_user
from app.api.deps import get_db
from app.models.my_model import House, User
from app.schemas.house import HouseCreate

router = APIRouter(prefix="/houses", tags=["houses"])

ICONS_DIR = "app/static/icons"
os.makedirs(ICONS_DIR, exist_ok=True)


@router.get("")
def get_houses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # only houses belonging to the user's school
    return db.query(House).filter(House.school_id == current_user.school_id).all()


@router.get("/{house_id}")
def get_house(house_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # only get house if it belongs to the current tenant
    house = db.query(House).filter(
        House.id == house_id,
        House.school_id == current_user.school_id
    ).first()
    if not house:
        raise HTTPException(status_code=404, detail="House not found")
    return house


@router.post("")
def create_house(
    name: str,
    description: str = None,
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # check duplicates within the same school
    existing = db.query(House).filter(
        House.name == name,
        House.school_id == current_user.school_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="House already exists")

    logo_filename = None
    if logo:
        # save uploaded file
        ext = os.path.splitext(logo.filename)[1]
        logo_filename = f"{name.replace(' ', '_')}{ext}"
        logo_path = os.path.join(ICONS_DIR, logo_filename)
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)

    house = House(
        name=name,
        description=description,
        total_points=0,
        logo_url=logo_filename,
        school_id=current_user.school_id
    )

    db.add(house)
    db.commit()
    db.refresh(house)
    return house

@router.put("/{house_id}")
def update_house(
    house_id: int,
    name: str = None,
    description: str = None,
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # get house for current tenant only
    house = db.query(House).filter(
        House.id == house_id,
        House.school_id == current_user.school_id
    ).first()
    if not house:
        raise HTTPException(status_code=404, detail="House not found in your school")

    # check duplicate name within tenant
    if name and name != house.name:
        duplicate = db.query(House).filter(
            House.name == name,
            House.school_id == current_user.school_id
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="House name already exists in your school")
        house.name = name

    if description is not None:
        house.description = description

    if logo:
        ext = os.path.splitext(logo.filename)[1]
        logo_filename = f"{house.name.replace(' ', '_')}{ext}"
        logo_path = os.path.join(ICONS_DIR, logo_filename)
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
        house.logo_url = logo_filename

    db.commit()
    db.refresh(house)
    return house


# ---------------- Tenant-Safe Delete ----------------
@router.delete("/{house_id}")
def delete_house(
    house_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    house = db.query(House).filter(
        House.id == house_id,
        House.school_id == current_user.school_id
    ).first()
    if not house:
        raise HTTPException(status_code=404, detail="House not found in your school")

    db.delete(house)
    db.commit()
    return {"message": "House deleted successfully"}