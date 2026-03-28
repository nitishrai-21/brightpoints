from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.my_model import School

router = APIRouter(prefix="/schools", tags=["schools"])

@router.get("")
def list_schools(db: Session = Depends(get_db)):
    """
    Return all schools for dropdown
    """
    schools = db.query(School).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "client_id": s.client_id,
            "domain": s.domain,
        }
        for s in schools
    ]