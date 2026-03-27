# backend/app/models/my_model.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    role = Column(String, default="teacher")

    points_given = relationship("PointsLog", back_populates="teacher")


class House(Base):
    __tablename__ = "houses"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(Text)
    logo_url = Column(String)

    total_points = Column(Integer, default=0)

    logs = relationship("PointsLog", back_populates="house")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    class_group = Column(String)  # 1A / 1B / 1C
    house_id = Column(Integer, ForeignKey("houses.id"))


class PointsLog(Base):
    __tablename__ = "points_logs"

    id = Column(Integer, primary_key=True)

    house_id = Column(Integer, ForeignKey("houses.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))

    points = Column(Integer)
    reason = Column(Text)

    class_group = Column(String, nullable=True)  # 🔥 NEW
    awarded_at = Column(DateTime, default=datetime.utcnow)

    house = relationship("House", back_populates="logs")
    teacher = relationship("User", back_populates="points_given")