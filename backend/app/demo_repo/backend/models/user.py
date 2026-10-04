"""
User domain model and credentials validation.
"""
from datetime import datetime
from backend.database.db import get_db

class User:
    def __init__(self, id: int, email: str, password_hash: str, full_name: str, role: str = "member"):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.role = role
        self.created_at = datetime.utcnow()

    @classmethod
    def find_by_email(cls, email: str):
        session = get_db()
        users = session.query(cls, email=email)
        return users[0] if users else None

    @classmethod
    def create(cls, email: str, password_hash: str, full_name: str):
        session = get_db()
        new_user = cls(id=101, email=email, password_hash=password_hash, full_name=full_name)
        session.add(new_user)
        session.commit()
        return new_user

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role
        }
