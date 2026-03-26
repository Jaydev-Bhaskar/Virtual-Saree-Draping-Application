# Virtual Fashion Try-On - Backend API

AI-powered Virtual Fashion Try-On system built with **FastAPI**, **MongoDB**, and **Python**.

## Features

- **JWT Authentication** with role-based access (user/admin)
- **User Image Upload** with local/Cloudinary storage
- **Clothing Inventory** CRUD with filtering and pagination
- **Virtual Try-On Engine** — generates composite try-on images
- **Side-by-Side Comparison** with AI ratings
- **AI Outfit Recommendations** — Gemini API integration (mock fallback)
- **Rate Limiting** — 10 req/min per user (in-memory or Redis)
- **Input Validation** — Pydantic schemas with sanitization
- **Structured Logging** and global exception handling
- **Render-ready** deployment (no Docker required)

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth.py              # Authentication routes
│   │   ├── uploads.py           # User image upload routes
│   │   ├── clothing.py          # Clothing inventory routes
│   │   ├── tryon.py             # Try-on & comparison routes
│   │   └── recommendations.py   # AI recommendation routes
│   ├── core/
│   │   ├── config.py            # Settings & env variables
│   │   ├── database.py          # MongoDB async connection
│   │   ├── security.py          # JWT & password hashing
│   │   ├── rate_limiter.py      # Rate limiting middleware
│   │   ├── logging_config.py    # Structured logging
│   │   └── exceptions.py        # Global exception handlers
│   ├── models/                  # MongoDB model references
│   ├── schemas/
│   │   ├── auth.py              # Auth request/response schemas
│   │   ├── clothing.py          # Clothing schemas
│   │   ├── tryon.py             # Try-on schemas
│   │   └── recommendation.py    # Recommendation schemas
│   ├── services/
│   │   ├── file_storage.py      # File upload & storage
│   │   ├── tryon_engine.py      # Try-on image generation
│   │   └── ai_recommendation.py # AI recommendation engine
│   └── main.py                  # FastAPI app entry point
├── tests/
│   └── test_api.py              # Unit tests
├── uploads/                     # Uploaded files (auto-created)
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Clone & Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URL and other settings
```

### 3. Run the Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000 --reload
```

Open **http://localhost:10000/docs** for interactive API documentation.

---

## MongoDB Collections

| Collection      | Description                          |
|----------------|--------------------------------------|
| `users`        | User accounts with hashed passwords  |
| `clothing`     | Clothing inventory items             |
| `uploads`      | User uploaded images                 |
| `tryon_results`| Try-on results and comparisons       |

---

## API Endpoints

### Authentication

| Method | Endpoint                     | Description              | Auth    |
|--------|------------------------------|--------------------------|---------|
| POST   | `/api/v1/auth/signup`        | Register new user        | No      |
| POST   | `/api/v1/auth/login`         | Login (get JWT)          | No      |
| GET    | `/api/v1/auth/me`            | Get profile              | Bearer  |
| POST   | `/api/v1/auth/create-admin`  | First-time admin setup   | No      |

### User Uploads

| Method | Endpoint                           | Description          | Auth    |
|--------|-------------------------------------|----------------------|---------|
| POST   | `/api/v1/uploads/`                  | Upload user image    | Bearer  |
| GET    | `/api/v1/uploads/`                  | List uploads         | Bearer  |
| GET    | `/api/v1/uploads/{id}`              | Get upload details   | Bearer  |
| DELETE | `/api/v1/uploads/{id}`              | Delete upload        | Bearer  |

### Clothing Inventory

| Method | Endpoint                              | Description             | Auth    |
|--------|----------------------------------------|-------------------------|---------|
| POST   | `/api/v1/clothing/`                    | Add clothing (admin)    | Admin   |
| GET    | `/api/v1/clothing/`                    | List with filters       | Bearer  |
| GET    | `/api/v1/clothing/{id}`                | Get clothing details    | Bearer  |
| PUT    | `/api/v1/clothing/{id}`                | Update clothing (admin) | Admin   |
| POST   | `/api/v1/clothing/{id}/image`          | Upload image (admin)    | Admin   |
| DELETE | `/api/v1/clothing/{id}`                | Delete clothing (admin) | Admin   |

### Virtual Try-On

| Method | Endpoint                      | Description                  | Auth    |
|--------|--------------------------------|------------------------------|---------|
| POST   | `/api/v1/try-on/`              | Generate try-on              | Bearer  |
| POST   | `/api/v1/try-on/compare`       | Compare outfits              | Bearer  |
| GET    | `/api/v1/try-on/history`       | Try-on history               | Bearer  |
| GET    | `/api/v1/try-on/{id}`          | Get specific result          | Bearer  |
| DELETE | `/api/v1/try-on/{id}`          | Delete result                | Bearer  |

### AI Recommendations

| Method | Endpoint                         | Description               | Auth    |
|--------|-----------------------------------|---------------------------|---------|
| POST   | `/api/v1/recommendations/`        | Full recommendations      | Bearer  |
| GET    | `/api/v1/recommendations/quick`   | Quick by occasion         | Bearer  |

---

## Sample API Requests (cURL)

### 1. Register User

```bash
curl -X POST http://localhost:10000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecureP@ss123",
    "full_name": "John Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:10000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=SecureP@ss123"
```

### 3. Create Admin (First Time)

```bash
curl -X POST http://localhost:10000/api/v1/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "AdminP@ss123",
    "full_name": "Admin User"
  }'
```

### 4. Upload User Image

```bash
curl -X POST http://localhost:10000/api/v1/uploads/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@photo.jpg"
```

### 5. Add Clothing (Admin)

```bash
curl -X POST http://localhost:10000/api/v1/clothing/ \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Silk Banarasi Saree",
    "type": "saree",
    "color": "red",
    "occasion": "wedding",
    "description": "Beautiful red silk saree with gold zari work",
    "price": 15000.00,
    "brand": "FabIndia",
    "tags": ["silk", "banarasi", "zari"]
  }'
```

### 6. List Clothing with Filters

```bash
curl -X GET "http://localhost:10000/api/v1/clothing/?type=saree&color=red&occasion=wedding&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Upload Clothing Image (Admin)

```bash
curl -X POST http://localhost:10000/api/v1/clothing/CLOTHING_ID/image \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@saree.jpg"
```

### 8. Virtual Try-On

```bash
curl -X POST http://localhost:10000/api/v1/try-on/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_image_id": "USER_IMAGE_ID",
    "clothing_ids": ["CLOTHING_ID_1", "CLOTHING_ID_2"]
  }'
```

### 9. Compare Outfits

```bash
curl -X POST http://localhost:10000/api/v1/try-on/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_image_id": "USER_IMAGE_ID",
    "clothing_ids": ["ID_1", "ID_2", "ID_3"]
  }'
```

### 10. AI Recommendations

```bash
curl -X POST http://localhost:10000/api/v1/recommendations/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "wedding",
    "preferred_colors": ["red", "gold"],
    "preferred_types": ["saree", "lehenga"],
    "budget_min": 5000,
    "budget_max": 20000
  }'
```

### 11. Quick Recommendations

```bash
curl -X GET "http://localhost:10000/api/v1/recommendations/quick?occasion=wedding" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Running Tests

```bash
pytest tests/ -v
```

---

## Render Deployment

### 1. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `fashion-tryon-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`

### 2. Set Environment Variables on Render

| Variable                        | Value                                  |
|---------------------------------|----------------------------------------|
| `MONGODB_URL`                   | Your MongoDB Atlas connection string   |
| `MONGODB_DB_NAME`               | `fashion_tryon`                        |
| `JWT_SECRET_KEY`                | Generate a secure random string        |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `1440`                               |
| `UPLOAD_DIR`                    | `uploads`                              |
| `MAX_FILE_SIZE_MB`              | `10`                                   |
| `DEBUG`                         | `false`                                |
| `CLOUDINARY_CLOUD_NAME`         | (optional) Your Cloudinary cloud name  |
| `CLOUDINARY_API_KEY`            | (optional) Your Cloudinary API key     |
| `CLOUDINARY_API_SECRET`         | (optional) Your Cloudinary API secret  |

### 3. MongoDB Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database user
3. Whitelist `0.0.0.0/0` for Render access
4. Get connection string and set as `MONGODB_URL`

### Important Notes for Render

- **File Storage**: Local uploads are **ephemeral** on Render (lost on redeploy). Use **Cloudinary** for persistent storage in production.
- **Port**: Render expects port `10000` (configured in start command).
- **Python Version**: Uses Render's default Python 3 runtime.

---

## Environment Variables

See `.env.example` for all configurable options.

---

## License

MIT
