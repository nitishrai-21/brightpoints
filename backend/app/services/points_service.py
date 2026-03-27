from sqlalchemy.orm import Session
from app.models.my_model import House, PointsLog, Student


def award_points(db: Session, house_id: int, teacher_id: int, points: int, reason: str, class_group: str | None):

    house = db.query(House).filter(House.id == house_id).first()

    # 🔥 If class-based → multiply by number of students
    if class_group:
        students = db.query(Student).filter(Student.class_group == class_group).all()
        points = points * len(students)

    log = PointsLog(
        house_id=house_id,
        teacher_id=teacher_id,
        points=points,
        reason=reason,
        class_group=class_group
    )

    house.total_points += points

    db.add(log)
    db.commit()
    db.refresh(log)

    return log