"""
Virtual Try-On API routes.
Handles try-on generation and comparison features.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import database
from app.core.security import get_current_user
from app.services.tryon_engine import tryon_engine_service
from app.schemas.tryon import (
    TryOnRequest,
    TryOnResponse,
    TryOnResult,
    ComparisonRequest,
    ComparisonResponse,
    ComparisonItem,
)
from bson import ObjectId
from typing import List
from fastapi import UploadFile, File, Form
import shutil
import sys
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/try-on", tags=["Virtual Try-On"])


async def _validate_user_image(image_id: str, user_id: str) -> dict:
    """Validate user owns the image and return upload doc."""
    try:
        upload = await database.db.uploads.find_one({
            "_id": ObjectId(image_id),
            "user_id": ObjectId(user_id),
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user image ID format",
        )

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User image not found. Upload an image first.",
        )
    return upload


async def _validate_clothing_items(clothing_ids: List[str]) -> List[dict]:
    """Validate clothing IDs and return docs."""
    items = []
    for cid in clothing_ids:
        try:
            item = await database.db.clothing.find_one({"_id": ObjectId(cid)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid clothing ID format: {cid}",
            )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clothing item not found: {cid}",
            )
        items.append(item)
    return items


@router.post("/quick-swap")
async def quick_swap(
    user_image: UploadFile = File(...),
    saree_image_path: str = Form(...) 
):
    """
    Directly triggers the new advanced MediaPipe and OpenCV Affine Face Swap pipeline.
    Standalone endpoint.
    """
    # 1. Add FaceExtractor folder to path 
    extractor_path = r"c:\Users\HP\Desktop\Avinython\FaceExtractor"
    if extractor_path not in sys.path:
        sys.path.append(extractor_path)
        
    try:
        from photorealistic_face_swap import PhotorealisticFaceSwap
    except ImportError:
        logger.error("Could not import PhotorealisticFaceSwap")
        raise HTTPException(status_code=500, detail="CV Backend Not Installed")
        
    # 2. Save user input image temporarily
    temp_user_path = f"uploads/temp_{user_image.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(temp_user_path, "wb") as f:
        shutil.copyfileobj(user_image.file, f)
        
    # 3. Resolve saree image path (since frontend gives '/images/xyz.png')
    saree_path = saree_image_path.lstrip("/")
    if "images/" in saree_path:
        # Resolve from frontend public folder since that's where the target apparel lives
        saree_path = f"../frontend/public/{saree_path}"
        
    if not os.path.exists(saree_path):
        raise HTTPException(status_code=400, detail=f"Target Saree image not found locally: {saree_path}")
        
    # 4. output config
    out_filename = f"swap_{int(datetime.now().timestamp())}.jpg"
    out_dir = "uploads/tryon"
    os.makedirs(out_dir, exist_ok=True)
    out_path = f"{out_dir}/{out_filename}"
    
    # 5. Process using the advanced pipeline!
    try:
        swapper = PhotorealisticFaceSwap()
        success = swapper.align_and_swap(temp_user_path, saree_path, out_path)
        if not success:
            raise Exception("Seamless cloning math failed internally")
            
        return {"url": f"/uploads/tryon/{out_filename}"}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Quick swap failed: {e}\n{error_details}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post(
    "/",
    response_model=TryOnResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate virtual try-on",
)
async def create_tryon(
    request: TryOnRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate virtual try-on images.
    Processes user image with selected clothing items and returns generated previews.
    """
    user_id = str(current_user["_id"])

    # Validate inputs
    upload = await _validate_user_image(request.user_image_id, user_id)
    clothing_items = await _validate_clothing_items(request.clothing_ids)

    # Process try-on
    user_image_path = upload.get("file_path") or upload.get("file_url", "")
    results = await tryon_engine_service.process_tryon(
        user_image_path, clothing_items
    )

    total_time = sum(r["processing_time_ms"] for r in results)

    # Store results in MongoDB
    tryon_doc = {
        "user_id": ObjectId(user_id),
        "user_image_id": ObjectId(request.user_image_id),
        "user_image_url": upload["file_url"],
        "clothing_ids": [ObjectId(cid) for cid in request.clothing_ids],
        "results": results,
        "total_processing_time_ms": total_time,
        "type": "tryon",
        "created_at": datetime.now(timezone.utc),
    }

    insert_result = await database.db.tryon_results.insert_one(tryon_doc)
    tryon_id = str(insert_result.inserted_id)

    logger.info(
        f"Try-on generated for user {current_user['username']}: "
        f"{len(results)} items in {total_time}ms"
    )

    return TryOnResponse(
        id=tryon_id,
        user_image_id=request.user_image_id,
        user_image_url=upload["file_url"],
        results=[TryOnResult(**r) for r in results],
        total_processing_time_ms=total_time,
        created_at=tryon_doc["created_at"].isoformat(),
    )


@router.post(
    "/compare",
    response_model=ComparisonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Compare multiple outfits side-by-side",
)
async def compare_outfits(
    request: ComparisonRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate side-by-side comparison of multiple outfits.
    Includes AI ratings and recommendation notes for each item.
    """
    user_id = str(current_user["_id"])

    # Validate inputs
    upload = await _validate_user_image(request.user_image_id, user_id)
    clothing_items = await _validate_clothing_items(request.clothing_ids)

    # Generate comparison
    user_image_path = upload.get("file_path") or upload.get("file_url", "")
    comparison_items = await tryon_engine_service.generate_comparison(
        user_image_path, clothing_items
    )

    # Store comparison in MongoDB
    comparison_doc = {
        "user_id": ObjectId(user_id),
        "user_image_id": ObjectId(request.user_image_id),
        "user_image_url": upload["file_url"],
        "clothing_ids": [ObjectId(cid) for cid in request.clothing_ids],
        "items": comparison_items,
        "best_match_clothing_id": comparison_items[0]["clothing_id"] if comparison_items else None,
        "type": "comparison",
        "created_at": datetime.now(timezone.utc),
    }

    insert_result = await database.db.tryon_results.insert_one(comparison_doc)
    comparison_id = str(insert_result.inserted_id)

    best_match = comparison_items[0] if comparison_items else None

    logger.info(
        f"Comparison generated for user {current_user['username']}: "
        f"{len(comparison_items)} items compared"
    )

    return ComparisonResponse(
        id=comparison_id,
        user_image_url=upload["file_url"],
        items=[ComparisonItem(**item) for item in comparison_items],
        best_match=ComparisonItem(**best_match) if best_match else None,
        created_at=comparison_doc["created_at"].isoformat(),
    )


@router.get(
    "/history",
    response_model=List[TryOnResponse],
    summary="Get try-on history",
)
async def get_tryon_history(
    current_user: dict = Depends(get_current_user),
):
    """Get the current user's try-on history."""
    cursor = (
        database.db.tryon_results.find({
            "user_id": ObjectId(str(current_user["_id"])),
            "type": "tryon",
        })
        .sort("created_at", -1)
        .limit(50)
    )

    history = await cursor.to_list(length=50)

    return [
        TryOnResponse(
            id=str(doc["_id"]),
            user_image_id=str(doc["user_image_id"]),
            user_image_url=doc.get("user_image_url", ""),
            results=[TryOnResult(**r) for r in doc.get("results", [])],
            total_processing_time_ms=doc.get("total_processing_time_ms", 0),
            created_at=str(doc.get("created_at", "")),
        )
        for doc in history
    ]


@router.get(
    "/{tryon_id}",
    response_model=TryOnResponse,
    summary="Get a specific try-on result",
)
async def get_tryon_result(
    tryon_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a specific try-on result."""
    try:
        doc = await database.db.tryon_results.find_one({
            "_id": ObjectId(tryon_id),
            "user_id": ObjectId(str(current_user["_id"])),
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid try-on ID format",
        )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on result not found",
        )

    return TryOnResponse(
        id=str(doc["_id"]),
        user_image_id=str(doc["user_image_id"]),
        user_image_url=doc.get("user_image_url", ""),
        results=[TryOnResult(**r) for r in doc.get("results", [])],
        total_processing_time_ms=doc.get("total_processing_time_ms", 0),
        created_at=str(doc.get("created_at", "")),
    )


@router.delete(
    "/{tryon_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a try-on result",
)
async def delete_tryon_result(
    tryon_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a specific try-on result."""
    try:
        doc = await database.db.tryon_results.find_one({
            "_id": ObjectId(tryon_id),
            "user_id": ObjectId(str(current_user["_id"])),
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid try-on ID format",
        )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on result not found",
        )

    await database.db.tryon_results.delete_one({"_id": ObjectId(tryon_id)})

    return {
        "success": True,
        "message": "Try-on result deleted successfully",
        "id": tryon_id,
    }
