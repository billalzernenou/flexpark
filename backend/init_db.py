#!/usr/bin/env python3
"""
Script pour initialiser la base de données avec les tables
À exécuter une seule fois au démarrage de l'application
"""

from app.database import engine
from app.models import Base

def init_db():
    """Crée toutes les tables"""
    Base.metadata.create_all(bind=engine)
    print("✓ Base de données initialisée avec succès!")

if __name__ == "__main__":
    init_db()
