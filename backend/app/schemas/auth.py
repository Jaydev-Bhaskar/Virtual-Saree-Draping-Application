"""
Pydantic schemas for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserSignup(BaseModel):
    """User registration request."""
    username: str = Field(
        ..., min_length=3, max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Alphanumeric username (3-50 chars)"
    )
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="Password (8-128 chars)"
    )
    full_name: str = Field(
        ..., min_length=1, max_length=100,
        description="Full name"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "SecureP@ss123",
                "full_name": "John Doe",
            }
        }


class UserLogin(BaseModel):
    """User login request (OAuth2 compatible)."""
    username: str = Field(..., description="Email or username")
    password: str = Field(..., description="Password")


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    role: str


class UserResponse(BaseModel):
    """User profile response."""
    id: str
    username: str
    email: str
    full_name: str
    role: str
    created_at: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "65f1a2b3c4d5e6f7a8b9c0d1",
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "role": "user",
                "created_at": "2024-03-15T10:30:00",
            }
        }
