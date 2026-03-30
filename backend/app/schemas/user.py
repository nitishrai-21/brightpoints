# app/schemas/security.py
from pydantic import BaseModel

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    school_id: int

    class Config:
        from_attributes = True  # for SQLAlchemy

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UpdateProfileRequest(BaseModel):
    display_name: str