#app/schemas/house.py
from pydantic import BaseModel
from typing import Optional

class HouseOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    total_points: int
    logo_url: Optional[str] = None  # added logo_url

    class Config:
        from_attributes = True

class HouseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    # logo will be handled as file upload, not in JSON