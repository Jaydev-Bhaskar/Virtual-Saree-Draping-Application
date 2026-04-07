"""
Authentication API routes.
Handles user registration, login, and profile retrieval.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import database
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.schemas.auth import (
    UserSignup,
    TokenResponse,
    UserResponse,
)
from bson import ObjectId
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def sanitize_input(value: str) -> str:
    """Basic input sanitization to prevent injection."""
    # Remove potential MongoDB operators
    sanitized = re.sub(r'[\$\{\}]', '', value)
    return sanitized.strip()


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(user_data: UserSignup):
    """
    Register a new user account.
    Returns JWT access token on success.
    """
    users = database.db.users

    # Sanitize inputs
    username = sanitize_input(user_data.username)
    email = sanitize_input(user_data.email)

    # Check for existing user
    existing = await users.find_one(
        {"$or": [{"email": email}, {"username": username}]}
    )
    if existing:
        if existing.get("email") == email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    # Create user document
    user_doc = {
        "username": username,
        "email": email,
        "password_hash": hash_password(user_data.password),
        "full_name": sanitize_input(user_data.full_name),
        "role": "user",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": user_id, "role": "user", "username": username}
    )

    logger.info(f"New user registered: {username} ({email})")

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        username=username,
        role="user",
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with credentials",
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user with username/email and password.
    Returns JWT access token on success.
    """
    users = database.db.users
    identifier = sanitize_input(form_data.username)

    # Find user by email or username
    user = await users.find_one(
        {"$or": [{"email": identifier}, {"username": identifier}]}
    )

    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user["_id"])
    access_token = create_access_token(
        data={
            "sub": user_id,
            "role": user.get("role", "user"),
            "username": user["username"],
        }
    )

    logger.info(f"User logged in: {user['username']}")

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        username=user["username"],
        role=user.get("role", "user"),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user.get("full_name", ""),
        role=current_user.get("role", "user"),
        created_at=str(current_user.get("created_at", "")),
    )


@router.post(
    "/create-admin",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create admin account (first-time setup only)",
)
async def create_admin(user_data: UserSignup):
    """
    Create an admin account. Only works if no admin exists.
    For initial setup only.
    """
    users = database.db.users

    # Check if admin already exists
    existing_admin = await users.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account already exists. Contact existing admin.",
        )

    username = sanitize_input(user_data.username)
    email = sanitize_input(user_data.email)

    # Check for existing user
    existing = await users.find_one(
        {"$or": [{"email": email}, {"username": username}]}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered",
        )

    user_doc = {
        "username": username,
        "email": email,
        "password_hash": hash_password(user_data.password),
        "full_name": sanitize_input(user_data.full_name),
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token(
        data={"sub": user_id, "role": "admin", "username": username}
    )

    logger.info(f"Admin account created: {username}")

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        username=username,
        role="admin",
    )
