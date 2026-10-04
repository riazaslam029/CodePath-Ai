# Demo Full-Stack SaaS Application

This is a complete sample repository demonstrating modern full-stack architecture with authentication and payments:

## Architecture & Flows

### Authentication Flow
1. **Frontend**: `frontend/src/components/Login.jsx` gathers user credentials.
2. **API Client**: `frontend/src/api/apiClient.js` sends POST request to `/api/v1/auth/login`.
3. **Route**: `backend/routes/auth_routes.py` receives request and delegates to auth service.
4. **Service**: `backend/services/auth_service.py` verifies hashed password against user record and generates JWT token.
5. **Model**: `backend/models/user.py` accesses user table.
6. **Database**: `backend/database/db.py` executes query and manages database connection pool.

### Payment Flow
1. **Frontend**: `frontend/src/components/CheckoutModal.jsx` initiates payment.
2. **API Client**: `frontend/src/api/apiClient.js` invokes `/api/v1/payments/charge`.
3. **Route**: `backend/routes/payment_routes.py` handles charge payload.
4. **Service**: `backend/services/payment_service.py` executes payment and saves ledger entry to database.
