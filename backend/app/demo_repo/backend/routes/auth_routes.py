"""
Authentication API routes exposed via FastAPI.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from backend.services.auth_service import auth_service_instance

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginPayload(BaseModel):
    email: str
    password: str

class RegisterPayload(BaseModel):
    email: str
    password: str
    fullName: str

@router.post("/login")
def login(payload: LoginPayload):
    """Authenticates credentials and returns a JWT session token."""
    user = auth_service_instance.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth_service_instance.generate_jwt_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/register")
def register(payload: RegisterPayload):
    """Registers a new user and provisions database record."""
    user = auth_service_instance.register_new_user(payload.email, payload.password, payload.fullName)
    token = auth_service_instance.generate_jwt_token(user)
    return {
        "access_token": token,
        "user": user.to_dict()
    }

@router.get("/me")
def get_current_user_profile():
    return {
        "id": 1,
        "email": "demo@codepath.ai",
        "fullName": "Alex River",
        "role": "engineer"
    }
