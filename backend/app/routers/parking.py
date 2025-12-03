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

# --- Reservation endpoints ---
@router.post("/reservation", response_model=schemas.ReservationOut)
def create_reservation(reservation: schemas.ReservationCreate, db: Session = Depends(get_db)):
    new_res = models.Reservation(**reservation.dict())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@router.get("/reservation", response_model=list[schemas.ReservationOut])
def list_reservations(db: Session = Depends(get_db)):
    return db.query(models.Reservation).all()
