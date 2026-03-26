"""
User upload API routes.
Handles user image upload, listing, and deletion.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.core.database import database
from app.core.security import get_current_user
from app.services.file_storage import file_storage_service
from app.schemas.recommendation import UploadResponse, UploadListResponse
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/uploads", tags=["User Uploads"])


@router.post(
    "/",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a user image",
)
async def upload_user_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a user image for virtual try-on.
    Supported formats: JPEG, PNG, WebP.
    Max size: 10MB.
    """
    # Save file
    file_data = await file_storage_service.save_file(file, category="users")

    # Store metadata in MongoDB
    upload_doc = {
        "user_id": ObjectId(str(current_user["_id"])),
        "filename": file_data["filename"],
        "original_filename": file_data["original_filename"],
        "file_url": file_data["file_url"],
        "file_path": file_data.get("file_path", ""),
        "file_size": file_data["file_size"],
        "content_type": file_data["content_type"],
        "uploaded_at": datetime.now(timezone.utc),
    }

    result = await database.db.uploads.insert_one(upload_doc)
    upload_id = str(result.inserted_id)

    logger.info(
        f"User {current_user['username']} uploaded image: {file_data['filename']}"
    )

    return UploadResponse(
        id=upload_id,
        filename=file_data["filename"],
        file_url=file_data["file_url"],
        file_size=file_data["file_size"],
        content_type=file_data["content_type"],
        uploaded_at=upload_doc["uploaded_at"].isoformat(),
    )


@router.get(
    "/",
    response_model=UploadListResponse,
    summary="List user uploaded images",
)
async def list_uploads(
    current_user: dict = Depends(get_current_user),
):
    """Get all images uploaded by the current user."""
    cursor = database.db.uploads.find(
        {"user_id": ObjectId(str(current_user["_id"]))}
    ).sort("uploaded_at", -1)

    uploads = await cursor.to_list(length=100)

    items = [
        UploadResponse(
            id=str(upload["_id"]),
            filename=upload["filename"],
            file_url=upload["file_url"],
            file_size=upload["file_size"],
            content_type=upload["content_type"],
            uploaded_at=str(upload.get("uploaded_at", "")),
        )
        for upload in uploads
    ]

    return UploadListResponse(items=items, total=len(items))


@router.get(
    "/{upload_id}",
    response_model=UploadResponse,
    summary="Get a specific upload",
)
async def get_upload(
    upload_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a specific uploaded image."""
    try:
        upload = await database.db.uploads.find_one({
            "_id": ObjectId(upload_id),
            "user_id": ObjectId(str(current_user["_id"])),
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload ID format",
        )

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found",
        )

    return UploadResponse(
        id=str(upload["_id"]),
        filename=upload["filename"],
        file_url=upload["file_url"],
        file_size=upload["file_size"],
        content_type=upload["content_type"],
        uploaded_at=str(upload.get("uploaded_at", "")),
    )


@router.delete(
    "/{upload_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an uploaded image",
)
async def delete_upload(
    upload_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an uploaded user image."""
    try:
        upload = await database.db.uploads.find_one({
            "_id": ObjectId(upload_id),
            "user_id": ObjectId(str(current_user["_id"])),
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload ID format",
        )

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found",
        )

    # Delete file from storage
    file_path = upload.get("file_path") or upload.get("file_url", "")
    await file_storage_service.delete_file(file_path)

    # Delete from database
    await database.db.uploads.delete_one({"_id": ObjectId(upload_id)})

    logger.info(
        f"User {current_user['username']} deleted upload: {upload['filename']}"
    )

    return {
        "success": True,
        "message": "Upload deleted successfully",
        "id": upload_id,
    }
