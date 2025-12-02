from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/parkings", tags=["parkings"])

@router.post("/", response_model=schemas.ParkingOut)
def create_parking(parking: schemas.ParkingCreate, db: Session = Depends(get_db)):
    new_parking = models.Parking(**parking.dict(), owner_id=1)  # temporaire owner_id
    db.add(new_parking)
    db.commit()
    db.refresh(new_parking)
    return new_parking
