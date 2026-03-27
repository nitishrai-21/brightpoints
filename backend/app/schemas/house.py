#app/schemas/house.py
from pydantic import BaseModel

class HouseOut(BaseModel):
    id: int
    name: str
    description: str
    total_points: int

    class Config:
        from_attributes = True

class HouseCreate(BaseModel):
    name: str
    description: str