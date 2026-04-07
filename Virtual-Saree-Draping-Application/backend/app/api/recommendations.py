"""
AI Recommendation API routes.
Provides outfit recommendations based on user preferences and inventory.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.core.database import database
from app.core.security import get_current_user
from app.services.ai_recommendation import ai_recommendation_service
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    OutfitSuggestion,
    StylingTip,
)
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])


@router.post(
    "/",
    response_model=RecommendationResponse,
    summary="Get AI outfit recommendations",
)
async def get_recommendations(
    request: RecommendationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Get AI-powered outfit recommendations based on preferences.
    Considers occasion, color preferences, clothing types, and budget.
    Uses Gemini API if configured, otherwise mock intelligence.
    """
    # Validate user image if provided
    if request.user_image_id:
        try:
            upload = await database.db.uploads.find_one({
                "_id": ObjectId(request.user_image_id),
                "user_id": ObjectId(str(current_user["_id"])),
            })
            if not upload:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User image not found",
                )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user image ID",
            )

    # Build query for relevant clothing items
    query = {}
    if request.occasion:
        query["occasion"] = request.occasion
    if request.preferred_types:
        query["type"] = {"$in": request.preferred_types}
    if request.preferred_colors:
        query["color"] = {
            "$in": [c.lower() for c in request.preferred_colors]
        }

    # If query is too restrictive, broaden it
    clothing_items = await database.db.clothing.find(query).to_list(length=50)

    if len(clothing_items) < 3:
        # Broaden search
        broader_query = {}
        if request.occasion:
            broader_query["occasion"] = request.occasion
        clothing_items = await database.db.clothing.find(
            broader_query
        ).to_list(length=50)

    if not clothing_items:
        # Get all items as fallback
        clothing_items = await database.db.clothing.find({}).to_list(length=50)

    if not clothing_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No clothing items available. Add inventory first.",
        )

    # Get AI recommendations
    result = await ai_recommendation_service.get_recommendations(
        clothing_items=clothing_items,
        occasion=request.occasion,
        preferred_colors=request.preferred_colors,
        preferred_types=request.preferred_types,
        budget_min=request.budget_min,
        budget_max=request.budget_max,
    )

    logger.info(
        f"Recommendations generated for user {current_user['username']}: "
        f"occasion={request.occasion}, {len(clothing_items)} items considered"
    )

    return RecommendationResponse(
        best_outfit=OutfitSuggestion(**result["best_outfit"]) if result["best_outfit"] else None,
        alternatives=[
            OutfitSuggestion(**alt) for alt in result.get("alternatives", [])
        ],
        occasion_match=result.get("occasion_match", ""),
        styling_tips=[
            StylingTip(**tip) for tip in result.get("styling_tips", [])
        ],
        overall_analysis=result.get("overall_analysis", ""),
    )


@router.get(
    "/quick",
    response_model=RecommendationResponse,
    summary="Quick recommendations by occasion",
)
async def quick_recommendations(
    occasion: Optional[str] = Query(
        "casual", description="Target occasion"
    ),
    limit: int = Query(5, ge=1, le=20, description="Max recommendations"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get quick outfit recommendations for a specific occasion.
    No detailed preferences required.
    """
    query = {}
    if occasion:
        query["occasion"] = occasion

    clothing_items = await database.db.clothing.find(query).to_list(
        length=limit * 3
    )

    if not clothing_items:
        clothing_items = await database.db.clothing.find({}).to_list(
            length=limit * 3
        )

    if not clothing_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No clothing items available",
        )

    result = await ai_recommendation_service.get_recommendations(
        clothing_items=clothing_items,
        occasion=occasion,
    )

    return RecommendationResponse(
        best_outfit=OutfitSuggestion(**result["best_outfit"]) if result["best_outfit"] else None,
        alternatives=[
            OutfitSuggestion(**alt) for alt in result.get("alternatives", [])
        ],
        occasion_match=result.get("occasion_match", ""),
        styling_tips=[
            StylingTip(**tip) for tip in result.get("styling_tips", [])
        ],
        overall_analysis=result.get("overall_analysis", ""),
    )
