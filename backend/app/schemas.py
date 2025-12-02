from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    class Config:
        orm_mode = True

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
    class Config:
        orm_mode = True
