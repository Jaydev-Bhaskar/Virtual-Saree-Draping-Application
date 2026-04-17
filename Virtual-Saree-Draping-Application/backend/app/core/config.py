"""
Application configuration using pydantic-settings.
Loads values from environment variables and .env file.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Virtual Fashion Try-On"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HF_TOKEN: Optional[str] = None

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "fashion_tryon"

    # JWT
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"

    # Cloudinary (optional)
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Redis (optional)
    REDIS_URL: Optional[str] = None

    # External Try-On API
    EXTERNAL_TRYON_API_KEY: Optional[str] = None
    EXTERNAL_TRYON_API_URL: Optional[str] = "https://api.external-tryon.example/v1/generate"

    # Gemini API (optional)
    GEMINI_API_KEY: Optional[str] = None

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 10000

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_TYPES.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def use_cloudinary(self) -> bool:
        return bool(
            self.CLOUDINARY_CLOUD_NAME
            and self.CLOUDINARY_API_KEY
            and self.CLOUDINARY_API_SECRET
        )

    @property
    def use_redis(self) -> bool:
        return bool(self.REDIS_URL)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
