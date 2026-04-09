"""
Clothing inventory API routes.
Handles CRUD operations for clothing items, with admin-only write access.
"""

import math
from datetime import datetime, timezone
from fastapi import (
    APIRouter, UploadFile, File, Form, HTTPException,
    status, Depends, Query,
)
from app.core.database import database
from app.core.security import get_current_user, get_current_admin
from app.services.file_storage import file_storage_service
from app.schemas.clothing import (
    ClothingCreate,
    ClothingUpdate,
    ClothingResponse,
    ClothingListResponse,
    ClothingType,
    Occasion,
)
from bson import ObjectId
from typing import Optional, List
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clothing", tags=["Clothing Inventory"])


def sanitize(value: str) -> str:
    """Sanitize string input."""
    return re.sub(r'[\$\{\}]', '', value).strip()


def clothing_doc_to_response(doc: dict) -> ClothingResponse:
    """Convert MongoDB document to response model."""
    return ClothingResponse(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        type=doc.get("type", "other"),
        color=doc.get("color", ""),
        occasion=doc.get("occasion", "casual"),
        description=doc.get("description"),
        price=doc.get("price"),
        brand=doc.get("brand"),
        tags=doc.get("tags", []),
        image_url=doc.get("image_url"),
        created_at=str(doc.get("created_at", "")),
        updated_at=str(doc.get("updated_at", "")),
    )


@router.post(
    "/",
    response_model=ClothingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new clothing item (Admin only)",
)
async def create_clothing(
    clothing_data: ClothingCreate,
    current_admin: dict = Depends(get_current_admin),
):
    """Add a new clothing item to inventory. Requires admin role."""
    clothing_doc = {
        "name": sanitize(clothing_data.name),
        "type": clothing_data.type.value,
        "color": sanitize(clothing_data.color),
        "occasion": clothing_data.occasion.value,
        "description": sanitize(clothing_data.description) if clothing_data.description else None,
        "price": clothing_data.price,
        "brand": sanitize(clothing_data.brand) if clothing_data.brand else None,
        "tags": [sanitize(t) for t in (clothing_data.tags or [])],
        "image_url": None,
        "created_by": ObjectId(str(current_admin["_id"])),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await database.db.clothing.insert_one(clothing_doc)
    clothing_doc["_id"] = result.inserted_id

    logger.info(f"Clothing added by {current_admin['username']}: {clothing_data.name}")

    return clothing_doc_to_response(clothing_doc)


@router.get(
    "/",
    response_model=ClothingListResponse,
    summary="List clothing with filters",
)
async def list_clothing(
    type: Optional[ClothingType] = Query(None, description="Filter by type"),
    color: Optional[str] = Query(None, description="Filter by color"),
    occasion: Optional[Occasion] = Query(None, description="Filter by occasion"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    search: Optional[str] = Query(None, description="Search in name/description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    List clothing items with filtering, search, and pagination.
    Available to all authenticated users.
    """
    # Build filter query
    query = {}

    if type:
        query["type"] = type.value
    if color:
        query["color"] = {"$regex": sanitize(color), "$options": "i"}
    if occasion:
        query["occasion"] = occasion.value
    if brand:
        query["brand"] = {"$regex": sanitize(brand), "$options": "i"}
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})
        query["price"]["$lte"] = max_price
    if search:
        safe_search = sanitize(search)
        query["$or"] = [
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"description": {"$regex": safe_search, "$options": "i"}},
            {"tags": {"$regex": safe_search, "$options": "i"}},
        ]

    # Get total count
    total = await database.db.clothing.count_documents(query)
    total_pages = max(1, math.ceil(total / page_size))

    # Get paginated results
    skip = (page - 1) * page_size
    cursor = (
        database.db.clothing.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(page_size)
    )
    items = await cursor.to_list(length=page_size)

    return ClothingListResponse(
        items=[clothing_doc_to_response(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{clothing_id}",
    response_model=ClothingResponse,
    summary="Get a specific clothing item",
)
async def get_clothing(
    clothing_id: str,
):
    """Get details of a specific clothing item."""
    try:
        item = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid clothing ID format",
        )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )

    return clothing_doc_to_response(item)


@router.put(
    "/{clothing_id}",
    response_model=ClothingResponse,
    summary="Update a clothing item (Admin only)",
)
async def update_clothing(
    clothing_id: str,
    update_data: ClothingUpdate,
    current_admin: dict = Depends(get_current_admin),
):
    """Update an existing clothing item. Requires admin role."""
    try:
        existing = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid clothing ID format",
        )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )

    # Build update dict from non-None fields
    update_fields = {}
    if update_data.name is not None:
        update_fields["name"] = sanitize(update_data.name)
    if update_data.type is not None:
        update_fields["type"] = update_data.type.value
    if update_data.color is not None:
        update_fields["color"] = sanitize(update_data.color)
    if update_data.occasion is not None:
        update_fields["occasion"] = update_data.occasion.value
    if update_data.description is not None:
        update_fields["description"] = sanitize(update_data.description)
    if update_data.price is not None:
        update_fields["price"] = update_data.price
    if update_data.brand is not None:
        update_fields["brand"] = sanitize(update_data.brand)
    if update_data.tags is not None:
        update_fields["tags"] = [sanitize(t) for t in update_data.tags]

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    update_fields["updated_at"] = datetime.now(timezone.utc)

    await database.db.clothing.update_one(
        {"_id": ObjectId(clothing_id)},
        {"$set": update_fields},
    )

    updated = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    logger.info(
        f"Clothing updated by {current_admin['username']}: {clothing_id}"
    )

    return clothing_doc_to_response(updated)


@router.post(
    "/{clothing_id}/image",
    response_model=ClothingResponse,
    summary="Upload clothing image (Admin only)",
)
async def upload_clothing_image(
    clothing_id: str,
    file: UploadFile = File(..., description="Clothing image"),
    current_admin: dict = Depends(get_current_admin),
):
    """Upload or update the image for a clothing item."""
    try:
        existing = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid clothing ID format",
        )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )

    # Delete old image if exists
    if existing.get("image_url"):
        old_path = existing.get("file_path") or existing.get("image_url", "")
        await file_storage_service.delete_file(old_path)

    # Save new image
    file_data = await file_storage_service.save_file(file, category="clothing")

    # Update document
    await database.db.clothing.update_one(
        {"_id": ObjectId(clothing_id)},
        {
            "$set": {
                "image_url": file_data["file_url"],
                "file_path": file_data.get("file_path", ""),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    updated = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    logger.info(
        f"Clothing image uploaded by {current_admin['username']}: {clothing_id}"
    )

    return clothing_doc_to_response(updated)


@router.delete(
    "/{clothing_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a clothing item (Admin only)",
)
async def delete_clothing(
    clothing_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """Delete a clothing item from inventory. Requires admin role."""
    try:
        existing = await database.db.clothing.find_one({"_id": ObjectId(clothing_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid clothing ID format",
        )

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )

    # Delete associated image
    if existing.get("image_url"):
        file_path = existing.get("file_path") or existing.get("image_url", "")
        await file_storage_service.delete_file(file_path)

    await database.db.clothing.delete_one({"_id": ObjectId(clothing_id)})

    logger.info(
        f"Clothing deleted by {current_admin['username']}: {clothing_id}"
    )

    return {
        "success": True,
        "message": "Clothing item deleted successfully",
        "id": clothing_id,
    }
