from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.points import PointsCreate, PointsLogResponse
from app.services.points_service import award_points
from app.models.my_model import PointsLog

router = APIRouter()


@router.post("/")
def add_points(data: PointsCreate, db: Session = Depends(get_db)):
    return award_points(
        db,
        house_id=data.house_id,
        teacher_id=1,
        points=data.points,
        reason=data.reason,
        class_group=data.class_group
    )


@router.get("/{house_id}", response_model=list[PointsLogResponse])
def get_logs(house_id: int, db: Session = Depends(get_db)):
    logs = (
        db.query(PointsLog)
        .filter(PointsLog.house_id == house_id)
        .order_by(PointsLog.awarded_at.desc())
        .all()
    )

    return [
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
    ]