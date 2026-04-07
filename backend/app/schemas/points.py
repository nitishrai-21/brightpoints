from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class PointsCreate(BaseModel):
    house_id: int
    points: int
    reason: str
    class_group: Optional[str] = None
    date_awarded: Optional[date] = None

class PointsLogResponse(BaseModel):
    id: int
    points: int
    reason: str
    class_group: Optional[str]
    awarded_at: datetime

    house_name: str
    teacher_name: str

    class Config:
        from_attributes = True