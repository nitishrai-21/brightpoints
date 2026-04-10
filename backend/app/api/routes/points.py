# app/api/routes/points.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.api.deps import get_db, get_current_user
from app.schemas.points import PointsCreate
from app.services.points_service import award_points
from app.models.my_model import PointsLog, User, House
from app.core.access import apply_points_access, require_teacher

router = APIRouter()


@router.post("/")
def add_points(data: PointsCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Add points for a house.
    """
    # ROLE CHECK
    require_teacher(current_user)

    # Ensure house belongs to the current user's school
    house = db.query(House).filter(
        House.id == data.house_id,
        House.school_id == current_user.school_id
    ).first()

    if not house:
        raise HTTPException(status_code=404, detail="House not found in your school")

    return award_points(
        db,
        house_id=data.house_id,
        teacher_id=current_user.id,  # Replace with actual teacher ID in production
        points=data.points,
        reason=data.reason,
        class_group=data.class_group,
        awarded_at=data.date_awarded,
    )


@router.get("/")
def get_logs(
    current_user: User = Depends(get_current_user),
    house_id: int | None = Query(None, alias="houseId", description="Filter by house ID"),
    teacher: str | None = Query(None, description="Filter by teacher name"),
    min_points: int | None = Query(None, alias="minPoints", description="Minimum points"),
    max_points: int | None = Query(None, alias="maxPoints", description="Maximum points"),
    search: str | None = Query(None, description="Search by reason, house, or teacher"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    query = db.query(PointsLog).join(PointsLog.teacher).join(PointsLog.house)

    # ---------------- Tenant Isolation ----------------
    query = query.filter(House.school_id == current_user.school_id)

    # ROLE-BASED ACCESS
    query = apply_points_access(query, current_user)

    # Apply filters
    if house_id is not None:
        query = query.filter(PointsLog.house_id == house_id)

    if teacher:
        query = query.filter(User.name.ilike(f"%{teacher}%"))

    if min_points is not None:
        query = query.filter(PointsLog.points >= min_points)

    if max_points is not None:
        query = query.filter(PointsLog.points <= max_points)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                PointsLog.reason.ilike(pattern)
            )
        )

    query = query.order_by(PointsLog.awarded_at.desc())

    # Debug: show the SQL query being executed
    # print("DEBUG SQL QUERY:")
    # print(query.statement.compile(compile_kwargs={"literal_binds": True}))

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