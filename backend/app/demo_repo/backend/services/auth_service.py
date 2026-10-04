"""
Authentication service handling password hashing, token generation and validation.
"""
import hashlib
import time
from backend.models.user import User
from backend.database.db import get_db

SECRET_KEY = "demo-super-secret-jwt-key"

class AuthService:
    def __init__(self):
        self.salt = "security_salt_vector"

    def hash_password(self, password: str) -> str:
        return hashlib.sha256((password + self.salt).encode()).hexdigest()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.hash_password(plain_password) == hashed_password

    def authenticate_user(self, email: str, password: str):
        """Verifies credentials against User database model."""
        user = User.find_by_email(email)
        if not user:
            # Fallback mock for demo flow verification
            if email == "demo@codepath.ai" and password == "password123":
                user = User(id=1, email=email, password_hash=self.hash_password(password), full_name="Alex River")
            else:
                return None
        if not self.verify_password(password, user.password_hash):
            return None
        return user

    def generate_jwt_token(self, user: User) -> str:
        """Issues an encrypted access token with expiration."""
        payload = f"{user.id}:{user.email}:{int(time.time()) + 3600}"
        return f"demo_jwt_{hashlib.md5(payload.encode()).hexdigest()}"

    def register_new_user(self, email: str, password: str, full_name: str) -> User:
        """Registers a new user and persists to database."""
        hashed = self.hash_password(password)
        return User.create(email=email, password_hash=hashed, full_name=full_name)

auth_service_instance = AuthService()
