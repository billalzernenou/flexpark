# Database Migration & Backend Setup Instructions

## Prerequisites

- PostgreSQL database must be running and accessible
- Python 3.8+ with the backend dependencies installed
- DATABASE_URL must be configured in `.env`

## Step 1: Install Backend Dependencies

```bash
cd /home/billal.zernenou/hackathon/flexpark/backend
pip install -r requirements.txt
```

## Step 2: Run the Migration (if you have an existing database)

This step adds the `firstName` and `lastName` columns to the existing `users` table:

```bash
cd /home/billal.zernenou/hackathon/flexpark/backend
python migrate_add_names.py
```

**Output should show:**

```
Adding firstName column to users table...
✓ firstName column added
Adding lastName column to users table...
✓ lastName column added

Database migration completed successfully!
```

## Step 3: Start the Backend Server

```bash
cd /home/billal.zernenou/hackathon/flexpark/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server should start without errors and seed demo data if needed.

## Testing the Authentication Flow

### 1. Register a new user:

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Expected response:

```json
{
  "id": 3,
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login:

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123"
  }'
```

Expected response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 3,
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 3. Use the Frontend

- Navigate to http://localhost:4200
- Click "Sign Up" and create an account with firstName and lastName
- Or login with demo credentials:
  - Email: alice@example.com
  - Password: hashed1 (or alice's actual password if set)

## Troubleshooting

### Error: "column users.firstName does not exist"

- Run the migration script: `python migrate_add_names.py`
- Verify PostgreSQL table: `psql -U your_user -d flexpark_db -c "SELECT column_name FROM information_schema.columns WHERE table_name='users';"`

### Error: "Invalid credentials" on login

- Ensure you're using existing user credentials (email + password from registration)
- The password must match exactly (it's hashed, so "hashed1" won't work as a real password)

### Frontend not connecting to backend

- Verify backend is running on port 8000
- Check that `environment.ts` has `apiUrl: 'http://localhost:8000'`
- Check browser console for CORS errors

### Database connection error

- Verify DATABASE_URL in `.env` is correct
- Test PostgreSQL connection: `psql -c "SELECT 1"`
- Ensure PostgreSQL service is running
