from sqlalchemy.orm import Session
from .models import User, Parking, Reservation
from datetime import datetime

def seed_data(db: Session):
    # Vérifier si déjà peuplé
    if db.query(User).count() > 0:
        return

    # Utilisateurs avec noms
    user1 = User(email="alice@example.com", password="hashed1", firstName="Alice", lastName="Dupont")
    user2 = User(email="bob@example.com", password="hashed2", firstName="Bob", lastName="Martin")
    db.add_all([user1, user2])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # Parking unique avec 12 places
    parking = Parking(name="Centre Parking", address="Place du centre", spots=12, owner_id=user1.id)
    db.add(parking)
    db.commit()
    db.refresh(parking)

    # Réservations fictives - places (A1-A5, B1-B4, C1-C3)
    reservations = [
        Reservation(date="2025-12-03", slot="A1", user_id=user1.id, parking_id=parking.id),
        Reservation(date="2025-12-03", slot="A2", user_id=user2.id, parking_id=parking.id),
        Reservation(date="2025-12-04", slot="B1", user_id=user2.id, parking_id=parking.id),
        Reservation(date="2025-12-05", slot="C2", user_id=user1.id, parking_id=parking.id),
    ]
    db.add_all(reservations)
    db.commit()
