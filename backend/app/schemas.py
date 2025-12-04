from pydantic import BaseModel, ConfigDict
from typing import List

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)

class ParkingCreate(BaseModel):
    name: str
    address: str
    spots: int


class ParkingOut(BaseModel):
    id: int
    name: str
    address: str
    spots: int
    owner_id: int
    model_config = ConfigDict(from_attributes=True)

# Schémas pour Reservation
class ReservationCreate(BaseModel):
    date: str  # Format YYYY-MM-DD
    slot: str  # Ex: "08:00-09:00"
    user_id: int
    parking_id: int

class ReservationOut(BaseModel):
    id: int
    date: str
    slot: str
    user_id: int
    parking_id: int
    model_config = ConfigDict(from_attributes=True)


# Schéma de pagination pour Reservation (total + items)
class ReservationPageOut(BaseModel):
    total: int
    items: List[ReservationOut]