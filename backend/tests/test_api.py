"""
Unit tests for critical API endpoints.
Run with: pytest tests/ -v
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import database
from app.core.security import hash_password, create_access_token
from bson import ObjectId
import os

# Test MongoDB URL (use a separate test database)
os.environ["MONGODB_URL"] = os.environ.get(
    "TEST_MONGODB_URL", "mongodb://localhost:27017"
)
os.environ["MONGODB_DB_NAME"] = "fashion_tryon_test"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing"


@pytest_asyncio.fixture
async def client():
    """Create async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Setup and teardown test database."""
    await database.connect()
    yield
    # Cleanup test data
    if database.db is not None:
        await database.db.users.delete_many({})
        await database.db.clothing.delete_many({})
        await database.db.uploads.delete_many({})
        await database.db.tryon_results.delete_many({})
    await database.disconnect()


def get_test_token(user_id: str = None, role: str = "user") -> str:
    """Generate a test JWT token."""
    uid = user_id or str(ObjectId())
    return create_access_token(
        data={"sub": uid, "role": role, "username": "testuser"}
    )


def get_auth_headers(token: str) -> dict:
    """Get authorization headers."""
    return {"Authorization": f"Bearer {token}"}


# ─── Health Check Tests ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test root endpoint returns API info."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert data["status"] == "running"


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Test health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data


# ─── Auth Tests ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signup_success(client):
    """Test successful user registration."""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "testuser1",
            "email": "test1@example.com",
            "password": "SecureP@ss123",
            "full_name": "Test User One",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "testuser1"
    assert data["role"] == "user"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client):
    """Test signup with duplicate email fails."""
    user_data = {
        "username": "testuser2",
        "email": "duplicate@example.com",
        "password": "SecureP@ss123",
        "full_name": "Test User",
    }
    # First signup
    await client.post("/api/v1/auth/signup", json=user_data)
    # Duplicate signup
    user_data["username"] = "testuser3"
    response = await client.post("/api/v1/auth/signup", json=user_data)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    """Test successful login."""
    # Register first
    await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "logintest",
            "email": "login@example.com",
            "password": "SecureP@ss123",
            "full_name": "Login Test",
        },
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "SecureP@ss123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """Test login with wrong password fails."""
    await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "wrongpw",
            "email": "wrongpw@example.com",
            "password": "SecureP@ss123",
            "full_name": "Wrong PW Test",
        },
    )

    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "wrongpw@example.com", "password": "WrongPassword123"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_unauthorized(client):
    """Test profile access without token fails."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


# ─── Clothing Tests ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_clothing_as_admin(client):
    """Test admin can create clothing items."""
    # Create admin user directly in DB
    admin_id = ObjectId()
    await database.db.users.insert_one({
        "_id": admin_id,
        "username": "admin_test",
        "email": "admin@test.com",
        "password_hash": hash_password("AdminP@ss123"),
        "full_name": "Admin User",
        "role": "admin",
    })

    token = get_test_token(str(admin_id), role="admin")

    response = await client.post(
        "/api/v1/clothing/",
        json={
            "name": "Red Silk Saree",
            "type": "saree",
            "color": "red",
            "occasion": "wedding",
            "description": "Beautiful red saree",
            "price": 15000.0,
            "brand": "TestBrand",
            "tags": ["silk", "wedding"],
        },
        headers=get_auth_headers(token),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Red Silk Saree"
    assert data["type"] == "saree"


@pytest.mark.asyncio
async def test_create_clothing_as_user_fails(client):
    """Test regular user cannot create clothing."""
    user_id = ObjectId()
    await database.db.users.insert_one({
        "_id": user_id,
        "username": "regular_user",
        "email": "user@test.com",
        "password_hash": hash_password("UserP@ss123"),
        "full_name": "Regular User",
        "role": "user",
    })

    token = get_test_token(str(user_id), role="user")

    response = await client.post(
        "/api/v1/clothing/",
        json={
            "name": "Test Item",
            "type": "dress",
            "color": "blue",
            "occasion": "casual",
        },
        headers=get_auth_headers(token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_clothing(client):
    """Test listing clothing items."""
    # Create user and clothing
    user_id = ObjectId()
    await database.db.users.insert_one({
        "_id": user_id,
        "username": "list_user",
        "email": "list@test.com",
        "password_hash": hash_password("UserP@ss123"),
        "full_name": "List User",
        "role": "user",
    })

    # Insert test clothing
    await database.db.clothing.insert_many([
        {
            "name": "Blue Kurta",
            "type": "kurta",
            "color": "blue",
            "occasion": "casual",
        },
        {
            "name": "Red Saree",
            "type": "saree",
            "color": "red",
            "occasion": "wedding",
        },
    ])

    token = get_test_token(str(user_id), role="user")

    response = await client.get(
        "/api/v1/clothing/",
        headers=get_auth_headers(token),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2


@pytest.mark.asyncio
async def test_filter_clothing_by_type(client):
    """Test filtering clothing by type."""
    user_id = ObjectId()
    await database.db.users.insert_one({
        "_id": user_id,
        "username": "filter_user",
        "email": "filter@test.com",
        "password_hash": hash_password("UserP@ss123"),
        "full_name": "Filter User",
        "role": "user",
    })

    await database.db.clothing.insert_many([
        {"name": "Saree 1", "type": "saree", "color": "red", "occasion": "wedding"},
        {"name": "Kurta 1", "type": "kurta", "color": "blue", "occasion": "casual"},
    ])

    token = get_test_token(str(user_id), role="user")

    response = await client.get(
        "/api/v1/clothing/?type=saree",
        headers=get_auth_headers(token),
    )
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["type"] == "saree"


# ─── Validation Tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signup_validation_short_password(client):
    """Test signup with short password fails validation."""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "shortpw",
            "email": "short@example.com",
            "password": "123",  # Too short
            "full_name": "Short PW",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_signup_validation_invalid_email(client):
    """Test signup with invalid email fails validation."""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "bademail",
            "email": "not-an-email",
            "password": "SecureP@ss123",
            "full_name": "Bad Email",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_signup_validation_invalid_username(client):
    """Test signup with special chars in username fails."""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "username": "bad user!",
            "email": "valid@example.com",
            "password": "SecureP@ss123",
            "full_name": "Bad Username",
        },
    )
    assert response.status_code == 422
