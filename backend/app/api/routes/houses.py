#app/api/routes/houses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.my_model import House
from app.schemas.house import HouseCreate

router = APIRouter(prefix="/houses", tags=["houses"])


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
def create_house(data: HouseCreate, db: Session = Depends(get_db)):
    existing = db.query(House).filter(House.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="House already exists")

    house = House(
        name=data.name,
        description=data.description,
        total_points=0
    )

    db.add(house)
    db.commit()
    db.refresh(house)

    return house