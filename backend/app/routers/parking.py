from fastapi import APIRouter, Depends, HTTPException, Query
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
    # Vérifier si l'utilisateur a déjà une réservation pour cette date
    existing_reservation = db.query(models.Reservation).filter(
        models.Reservation.user_id == reservation.user_id,
        models.Reservation.date == reservation.date
    ).first()

    if existing_reservation:
        raise HTTPException(
            status_code=400,
            detail="Vous avez déjà une réservation pour cette date. Veuillez annuler votre réservation actuelle pour en créer une autre."
        )

    new_res = models.Reservation(**reservation.dict())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res


@router.get("/reservation", response_model=schemas.ReservationPageOut)
def list_reservations(
    db: Session = Depends(get_db),
    user_id: int = Query(None, description="ID de l'utilisateur"),
    date: str = Query(None, description="Date au format YYYY-MM-DD"),
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(10, ge=1, le=100, description="Taille de la page")
):
    query = db.query(models.Reservation)
    if user_id:
        query = query.filter(models.Reservation.user_id == user_id)
    if date:
        query = query.filter(models.Reservation.date == date)
    query = query.order_by(models.Reservation.date.desc())
    total = query.count()
    reservations = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "items": reservations}

@router.delete("/reservation/{id}")
def delete_reservation(id: int, db: Session = Depends(get_db)):
    reservation = db.query(models.Reservation).filter(models.Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    db.delete(reservation)
    db.commit()
    return {"message": "Réservation annulée avec succès"}
