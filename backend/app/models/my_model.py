# backend/app/models/my_model.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import TimestampMixin
from datetime import datetime
from app.core.database import Base


# ----------------- School / Tenant -----------------
class School(TimestampMixin, Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    client_id = Column(String, nullable=True)       # Google OAuth client ID
    client_secret = Column(String, nullable=True)   # Google OAuth secret
    domain = Column(String, nullable=True)          # Optional domain filter for school

    users = relationship("User", back_populates="school")
    houses = relationship("House", back_populates="school")


# ----------------- User -----------------
class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="student")  # teacher / student / admin
    class_group = Column(String, nullable=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)

    school = relationship("School", back_populates="users")
    points_given = relationship("PointsLog", back_populates="teacher")
    refresh_tokens = relationship("RefreshToken", back_populates="user")


# ----------------- Refresh Token -----------------
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")


# ----------------- House -----------------
class House(TimestampMixin, Base):
    __tablename__ = "houses"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    total_points = Column(Integer, default=0)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)

    motto = Column(String, nullable=True)
    class_color = Column(String, nullable=True)  # Hex color string, e.g. "#ff0000"

    logs = relationship("PointsLog", back_populates="house")
    # students = relationship("Student", back_populates="house")
    school = relationship("School", back_populates="houses")


# ----------------- Student -----------------
# class Student(TimestampMixin, Base):
#     __tablename__ = "students"

#     id = Column(Integer, primary_key=True)
#     name = Column(String, nullable=False)
#     class_group = Column(String)  # e.g., 1A / 1B / 1C
#     house_id = Column(Integer, ForeignKey("houses.id"))

#     house = relationship("House", back_populates="students")


# ----------------- Points Log -----------------
class PointsLog(TimestampMixin, Base):
    __tablename__ = "points_logs"

    id = Column(Integer, primary_key=True)
    house_id = Column(Integer, ForeignKey("houses.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    points = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    class_group = Column(String, nullable=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    house = relationship("House", back_populates="logs")
    teacher = relationship("User", back_populates="points_given")