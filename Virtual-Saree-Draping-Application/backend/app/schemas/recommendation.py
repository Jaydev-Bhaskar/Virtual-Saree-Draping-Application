"""
Pydantic schemas for AI recommendation API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendationRequest(BaseModel):
    """AI recommendation request."""
    user_image_id: Optional[str] = Field(
        None, description="Optional user image for body-type analysis"
    )
    occasion: Optional[str] = Field(
        None, description="Target occasion (wedding, casual, etc.)"
    )
    preferred_colors: Optional[List[str]] = Field(
        default_factory=list, description="Preferred color palette"
    )
    preferred_types: Optional[List[str]] = Field(
        default_factory=list, description="Preferred clothing types"
    )
    budget_min: Optional[float] = Field(None, ge=0)
    budget_max: Optional[float] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "user_image_id": "65f1a2b3c4d5e6f7a8b9c0d1",
                "occasion": "wedding",
                "preferred_colors": ["red", "gold"],
                "preferred_types": ["saree", "lehenga"],
                "budget_min": 5000,
                "budget_max": 20000,
            }
        }


class OutfitSuggestion(BaseModel):
    """Single outfit suggestion."""
    clothing_id: str
    clothing_name: str
    clothing_type: str
    color: str
    price: Optional[float] = None
    image_url: Optional[str] = None
    match_score: float = Field(ge=0, le=100, description="Match percentage")
    reason: str


class StylingTip(BaseModel):
    """Styling tip from AI."""
    category: str
    tip: str
    priority: str = Field(description="high, medium, low")


class RecommendationResponse(BaseModel):
    """AI recommendation response."""
    best_outfit: OutfitSuggestion
    alternatives: List[OutfitSuggestion]
    occasion_match: str
    styling_tips: List[StylingTip]
    overall_analysis: str


class UploadResponse(BaseModel):
    """User image upload response."""
    id: str
    filename: str
    file_url: str
    file_size: int
    content_type: str
    uploaded_at: str


class UploadListResponse(BaseModel):
    """List of uploaded images."""
    items: List[UploadResponse]
    total: int
