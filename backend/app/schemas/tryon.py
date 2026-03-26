"""
Pydantic schemas for try-on engine and comparison.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TryOnRequest(BaseModel):
    """Virtual try-on request."""
    user_image_id: str = Field(..., description="ID of the user's uploaded image")
    clothing_ids: List[str] = Field(
        ..., min_length=1, max_length=5,
        description="List of clothing item IDs (1-5)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_image_id": "65f1a2b3c4d5e6f7a8b9c0d1",
                "clothing_ids": [
                    "65f1a2b3c4d5e6f7a8b9c0d2",
                    "65f1a2b3c4d5e6f7a8b9c0d3",
                ],
            }
        }


class TryOnResult(BaseModel):
    """Single try-on result."""
    clothing_id: str
    clothing_name: str
    clothing_type: str
    original_image_url: Optional[str] = None
    generated_image_url: str
    confidence_score: float = Field(ge=0, le=1)
    processing_time_ms: int


class TryOnResponse(BaseModel):
    """Virtual try-on response."""
    id: str
    user_image_id: str
    user_image_url: str
    results: List[TryOnResult]
    total_processing_time_ms: int
    created_at: str


class ComparisonRequest(BaseModel):
    """Side-by-side comparison request."""
    user_image_id: str = Field(..., description="ID of the user's uploaded image")
    clothing_ids: List[str] = Field(
        ..., min_length=2, max_length=6,
        description="List of clothing IDs to compare (2-6)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_image_id": "65f1a2b3c4d5e6f7a8b9c0d1",
                "clothing_ids": [
                    "65f1a2b3c4d5e6f7a8b9c0d2",
                    "65f1a2b3c4d5e6f7a8b9c0d3",
                    "65f1a2b3c4d5e6f7a8b9c0d4",
                ],
            }
        }


class ComparisonItem(BaseModel):
    """Single item in comparison."""
    clothing_id: str
    clothing_name: str
    clothing_type: str
    color: str
    occasion: str
    generated_image_url: str
    confidence_score: float
    ai_rating: float = Field(ge=0, le=10, description="AI rating out of 10")
    recommendation_notes: str


class ComparisonResponse(BaseModel):
    """Side-by-side comparison response."""
    id: str
    user_image_url: str
    items: List[ComparisonItem]
    best_match: ComparisonItem
    created_at: str
