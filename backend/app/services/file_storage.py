"""
File storage service.
Supports local storage and Cloudinary cloud storage.
Handles file validation, upload, and retrieval.
"""

import os
import uuid
import aiofiles
from datetime import datetime
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class FileStorageService:
    """Handles file upload, storage, and retrieval."""

    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self._ensure_directories()

    def _ensure_directories(self):
        """Create upload directories if they don't exist."""
        dirs = [
            self.upload_dir,
            os.path.join(self.upload_dir, "users"),
            os.path.join(self.upload_dir, "clothing"),
            os.path.join(self.upload_dir, "tryon"),
        ]
        for d in dirs:
            os.makedirs(d, exist_ok=True)

    def validate_file(self, file: UploadFile) -> None:
        """Validate file type and size."""
        # Validate content type
        if file.content_type not in settings.allowed_image_types_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. "
                f"Allowed: {settings.ALLOWED_IMAGE_TYPES}",
            )

    async def validate_file_size(self, file: UploadFile) -> int:
        """Read and validate file size. Returns file size in bytes."""
        content = await file.read()
        size = len(content)

        if size > settings.max_file_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
            )

        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded",
            )

        # Reset file position
        await file.seek(0)
        return size

    async def save_file(
        self, file: UploadFile, category: str = "users"
    ) -> dict:
        """
        Save uploaded file to local storage or Cloudinary.
        Returns file metadata dict.
        """
        self.validate_file(file)
        file_size = await self.validate_file_size(file)

        if settings.use_cloudinary:
            return await self._save_to_cloudinary(file, category, file_size)
        else:
            return await self._save_to_local(file, category, file_size)

    async def _save_to_local(
        self, file: UploadFile, category: str, file_size: int
    ) -> dict:
        """Save file to local filesystem."""
        ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
        # Sanitize extension
        ext = ext.lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"

        unique_name = f"{uuid.uuid4().hex}{ext}"
        rel_path = os.path.join(category, unique_name)
        full_path = os.path.join(self.upload_dir, rel_path)

        try:
            content = await file.read()
            async with aiofiles.open(full_path, "wb") as f:
                await f.write(content)

            file_url = f"/uploads/{rel_path}"
            logger.info(f"File saved locally: {file_url} ({file_size} bytes)")

            return {
                "filename": unique_name,
                "original_filename": file.filename,
                "file_url": file_url,
                "file_path": full_path,
                "file_size": file_size,
                "content_type": file.content_type,
                "category": category,
                "uploaded_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Failed to save file locally: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file",
            )

    async def _save_to_cloudinary(
        self, file: UploadFile, category: str, file_size: int
    ) -> dict:
        """Save file to Cloudinary."""
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
            )

            content = await file.read()
            result = cloudinary.uploader.upload(
                content,
                folder=f"fashion_tryon/{category}",
                resource_type="image",
            )

            file_url = result.get("secure_url", result.get("url"))
            logger.info(f"File saved to Cloudinary: {file_url}")

            return {
                "filename": result.get("public_id", "").split("/")[-1],
                "original_filename": file.filename,
                "file_url": file_url,
                "file_path": result.get("public_id", ""),
                "file_size": file_size,
                "content_type": file.content_type,
                "category": category,
                "cloudinary_id": result.get("public_id"),
                "uploaded_at": datetime.utcnow().isoformat(),
            }
        except ImportError:
            logger.warning("Cloudinary not installed, falling back to local storage")
            await file.seek(0)
            return await self._save_to_local(file, category, file_size)
        except Exception as e:
            logger.error(f"Cloudinary upload error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file to cloud storage",
            )

    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage."""
        try:
            if file_path.startswith("http"):
                # Cloudinary file - delete using public_id
                return await self._delete_from_cloudinary(file_path)
            else:
                # Local file
                local_path = file_path.lstrip("/")
                if os.path.exists(local_path):
                    os.remove(local_path)
                    logger.info(f"File deleted: {local_path}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Failed to delete file: {e}")
            return False

    async def _delete_from_cloudinary(self, public_id: str) -> bool:
        """Delete file from Cloudinary."""
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
            )
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            logger.error(f"Cloudinary delete error: {e}")
            return False


# Singleton instance
file_storage_service = FileStorageService()
