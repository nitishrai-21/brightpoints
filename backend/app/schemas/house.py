from pydantic import BaseModel, constr, validator, Field
from typing import Optional
import re

HEX_COLOR_REGEX = r"^#(?:[0-9a-fA-F]{3}){1,2}$"

# ---------------- Base Fields ----------------
class HouseBase(BaseModel):
    name: constr(min_length=1, max_length=100)
    motto: Optional[constr(max_length=200)] = ""
    color: str = Field(..., alias="class_color")  # maps ORM class_color to schema color
    description: Optional[constr(max_length=1000)] = None

    @validator("color")
    def validate_color(cls, v):
        if not re.match(HEX_COLOR_REGEX, v):
            raise ValueError("Invalid hex color")
        return v

    class Config:
        allow_population_by_field_name = True  # allow using `color` in responses
        orm_mode = True  # works with SQLAlchemy models

# ---------------- Input Schemas ----------------
class HouseCreate(HouseBase):
    pass  # file upload handled separately

class HouseUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=100)]
    motto: Optional[constr(max_length=200)]
    color: Optional[str] = None
    description: Optional[constr(max_length=500)] = None

    @validator("color")
    def validate_color(cls, v):
        if v is not None and not re.match(HEX_COLOR_REGEX, v):
            raise ValueError("Invalid hex color")
        return v

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

# ---------------- Output Schema ----------------
class HouseOut(HouseBase):
    id: int
    total_points: int
    logo_url: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True