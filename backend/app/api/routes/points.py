# app/api/routes/points.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.points import PointsCreate
from app.services.points_service import award_points
from app.models.my_model import PointsLog, User, House
from sqlalchemy import or_

router = APIRouter()


@router.post("/")
def add_points(data: PointsCreate, db: Session = Depends(get_db)):
    """
    Add points for a house.
    """
    return award_points(
        db,
        house_id=data.house_id,
        teacher_id=1,  # Replace with actual teacher ID in production
        points=data.points,
        reason=data.reason,
        class_group=data.class_group,
    )

@router.get("/")
def get_logs(
    house_id: int | None = Query(None, description="Filter by house ID"),
    search: str | None = Query(None, description="Search by reason, house, or teacher"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    query = db.query(PointsLog)

    if house_id is not None:
        query = query.filter(PointsLog.house_id == house_id)

    if search:
        search_pattern = f"%{search}%"
        # Join both related tables
        query = query.join(PointsLog.teacher).join(PointsLog.house)
        query = query.filter(
            or_(
                PointsLog.reason.ilike(search_pattern),
                User.name.ilike(search_pattern),  # filter on User.name
                House.name.ilike(search_pattern),  # filter on House.name
            )
        )

    query = query.order_by(PointsLog.awarded_at.desc())

    total = query.count()
    logs = query.offset(offset).limit(limit).all()

    return {
        "data": [
            {
                "id": log.id,
                "points": log.points,
                "reason": log.reason,
                "class_group": log.class_group,
                "awarded_at": log.awarded_at,
                "house_name": log.house.name,
                "teacher_name": log.teacher.name,
            }
            for log in logs
        ],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit,
    }