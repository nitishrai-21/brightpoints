from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
import logging

from app.api.deps import get_db, get_current_user
from app.models.my_model import House, User
from app.schemas.house import HouseOut, HouseCreate, HouseUpdate
from app.api.utils import validation_error, pydantic_error_response
from pydantic import ValidationError

router = APIRouter(prefix="/houses", tags=["houses"])

ICONS_DIR = "app/static/icons"
os.makedirs(ICONS_DIR, exist_ok=True)

logger = logging.getLogger(__name__)


# ---------------- Helper ----------------
def get_house_for_school(db: Session, house_id: int, user: User) -> House:
    house = db.query(House).filter(
        House.id == house_id,
        House.school_id == user.school_id
    ).first()
    if not house:
        raise HTTPException(status_code=404, detail="House not found in your school")
    return house


# ---------------- CRUD ----------------
@router.get("", response_model=list[HouseOut])
def get_houses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        houses = db.query(House).filter(House.school_id == current_user.school_id).all()
        return houses
    except Exception as e:
        logger.error(f"Failed to fetch houses: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{house_id}", response_model=HouseOut)
def get_house(house_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return get_house_for_school(db, house_id, current_user)
    except Exception as e:
        logger.error(f"Failed to fetch house {house_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("", response_model=HouseOut)
def create_house(
    name: str = Form(...),
    motto: str = Form(""),
    color: str = Form(...),
    description: str = Form(None),
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        house_in = HouseCreate(
            name=name,
            motto=motto,
            class_color=color,
            description=description
        )
    except ValidationError as e:
        return pydantic_error_response(e)

    existing = db.query(House).filter(
        House.name == house_in.name,
        House.school_id == current_user.school_id
    ).first()
    if existing:
        return validation_error("House already exists in your school")

    # Save Logo
    logo_filename = None
    if logo:
        if logo.content_type not in ["image/png", "image/jpeg"]:
            return validation_error("Logo must be PNG or JPEG")
        ext = os.path.splitext(logo.filename)[1]
        logo_filename = f"{house_in.name.replace(' ', '_')}{ext}"
        logo_path = os.path.join(ICONS_DIR, logo_filename)
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)

    # Create House
    house = House(
        name=house_in.name,
        motto=house_in.motto,
        class_color=house_in.color,
        description=house_in.description,
        total_points=0,
        logo_url=logo_filename,
        school_id=current_user.school_id
    )
    db.add(house)
    db.commit()
    db.refresh(house)
    return house


@router.put("/{house_id}", response_model=HouseOut)
def update_house(
    house_id: int,
    name: str = Form(None),
    motto: str = Form(None),
    color: str = Form(None),
    description: str = Form(None),
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    house = get_house_for_school(db, house_id, current_user)

    # Validate input using schema
    try:
        house_in = HouseUpdate(
            name=name,
            motto=motto,
            color=color,
            description=description
        )
    except ValidationError as e:
        return pydantic_error_response(e)

    # Check for duplicate name
    if house_in.name and house_in.name != house.name:
        duplicate = db.query(House).filter(
            House.name == house_in.name,
            House.school_id == current_user.school_id
        ).first()
        if duplicate:
            return validation_error("House name already exists in your school")
        house.name = house_in.name

    # Update fields
    if house_in.motto is not None:
        house.motto = house_in.motto
    if house_in.color is not None:
        house.class_color = house_in.color
    if house_in.description is not None:
        house.description = house_in.description

    # Update Logo
    if logo:
        if logo.content_type not in ["image/png", "image/jpeg"]:
            return validation_error("Logo must be PNG or JPEG")
        ext = os.path.splitext(logo.filename)[1]
        logo_filename = f"{house.name.replace(' ', '_')}{ext}"
        logo_path = os.path.join(ICONS_DIR, logo_filename)
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
        house.logo_url = logo_filename

    db.commit()
    db.refresh(house)
    return house


@router.delete("/{house_id}")
def delete_house(
    house_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    house = get_house_for_school(db, house_id, current_user)

    if house.logo_url:
        logo_path = os.path.join(ICONS_DIR, house.logo_url)
        if os.path.exists(logo_path):
            os.remove(logo_path)

    db.delete(house)
    db.commit()
    return {"message": "House deleted successfully"}