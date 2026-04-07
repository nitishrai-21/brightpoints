from sqlalchemy.orm import Session
from datetime import datetime, time
from app.models.my_model import House, PointsLog


def award_points(db: Session, house_id: int, teacher_id: int, points: int, reason: str, class_group: str | None, awarded_at: str | None = None,):

    house = db.query(House).filter(House.id == house_id).first()

    # If class-based → multiply by number of students
    # if class_group:
    #     students = db.query(Student).filter(Student.class_group == class_group).all()
    #     points = points * len(students)

    # Convert date to datetime at start of day, or use now if None
    awarded_dt = datetime.combine(awarded_at, time.min) if awarded_at else datetime.utcnow()

    log = PointsLog(
        house_id=house_id,
        teacher_id=teacher_id,
        points=points,
        reason=reason,
        class_group=class_group,
        awarded_at=awarded_dt
    )

    house.total_points += points

    db.add(log)
    db.commit()
    db.refresh(log)

    return log