"""
Database migration script to add firstName and lastName columns to the users table.
Run this before starting the application if you have an existing PostgreSQL database.
"""
import os
from sqlalchemy import text
from dotenv import load_dotenv
from app.database import engine

load_dotenv()

def add_name_columns():
    """Add firstName and lastName columns to users table if they don't exist"""
    with engine.connect() as connection:
        # Check if columns exist
        result = connection.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('firstName', 'lastName')
        """))
        
        existing_columns = [row[0] for row in result.fetchall()]
        
        # Add firstName if it doesn't exist
        if 'firstName' not in existing_columns:
            print("Adding firstName column to users table...")
            connection.execute(text("ALTER TABLE users ADD COLUMN firstName VARCHAR(255)"))
            connection.commit()
            print("✓ firstName column added")
        else:
            print("✓ firstName column already exists")
        
        # Add lastName if it doesn't exist
        if 'lastName' not in existing_columns:
            print("Adding lastName column to users table...")
            connection.execute(text("ALTER TABLE users ADD COLUMN lastName VARCHAR(255)"))
            connection.commit()
            print("✓ lastName column added")
        else:
            print("✓ lastName column already exists")
        
        print("\nDatabase migration completed successfully!")

if __name__ == "__main__":
    try:
        add_name_columns()
    except Exception as e:
        print(f"✗ Migration error: {e}")
        exit(1)
