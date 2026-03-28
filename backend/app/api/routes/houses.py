#app/api/routes/houses.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.api.deps import get_db
from app.models.my_model import House
from app.schemas.house import HouseCreate

router = APIRouter(prefix="/houses", tags=["houses"])

ICONS_DIR = "app/static/icons"
os.makedirs(ICONS_DIR, exist_ok=True)


@router.get("")
def get_houses(db: Session = Depends(get_db)):
    return db.query(House).all()


@router.get("/{house_id}")
def get_house(house_id: int, db: Session = Depends(get_db)):
    house = db.query(House).filter(House.id == house_id).first()
    if not house:
        raise HTTPException(status_code=404, detail="House not found")
    return house


@router.post("")
def create_house(
    name: str,
    description: str = None,
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    # check for duplicates
    existing = db.query(House).filter(House.name == name).first()
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
    )

    db.add(house)
    db.commit()
    db.refresh(house)
    return house