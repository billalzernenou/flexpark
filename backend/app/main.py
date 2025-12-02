from fastapi import FastAPI
from .database import Base, engine
from .routers import auth, parking, news

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlexPark API")

# Routers
app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(news.router)
