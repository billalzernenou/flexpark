from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    firstName = Column(String, nullable=True)
    lastName = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)


class Parking(Base):
    __tablename__ = "parkings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    spots = Column(Integer, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
    reservations = relationship("Reservation", back_populates="parking")


class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  # Format YYYY-MM-DD
    slot = Column(String, nullable=False)  # Ex: "08:00-09:00"
    user_id = Column(Integer, ForeignKey("users.id"))
    parking_id = Column(Integer, ForeignKey("parkings.id"))

    user = relationship("User")
    parking = relationship("Parking", back_populates="reservations")
