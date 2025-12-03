from sqlalchemy.orm import Session
from .models import User, Parking, Reservation
from datetime import datetime

def seed_data(db: Session):
    # Vérifier si déjà peuplé
    if db.query(User).count() > 0:
        return

    # Utilisateurs
    user1 = User(email="alice@example.com", password="hashed1")
    user2 = User(email="bob@example.com", password="hashed2")
    db.add_all([user1, user2])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # Parkings
    parking1 = Parking(name="Parking Centre", address="1 rue du Centre", spots=10, owner_id=user1.id)
    parking2 = Parking(name="Parking Gare", address="2 rue de la Gare", spots=8, owner_id=user2.id)
    db.add_all([parking1, parking2])
    db.commit()
    db.refresh(parking1)
    db.refresh(parking2)

    # Créneaux (slots)
    slots = ["08:00-09:00", "09:00-10:00", "10:00-11:00"]
    dates = ["2025-12-03", "2025-12-04", "2025-12-05", "2025-12-06"]

    # Réservations fictives
    reservations = [
        Reservation(date="2025-12-03", slot="08:00-09:00", user_id=user1.id, parking_id=parking1.id),
        Reservation(date="2025-12-03", slot="09:00-10:00", user_id=user2.id, parking_id=parking1.id),
        Reservation(date="2025-12-04", slot="08:00-09:00", user_id=user2.id, parking_id=parking2.id),
        Reservation(date="2025-12-05", slot="10:00-11:00", user_id=user1.id, parking_id=parking2.id),
        Reservation(date="2025-12-06", slot="09:00-10:00", user_id=user2.id, parking_id=parking1.id),
    ]
    db.add_all(reservations)
    db.commit()
