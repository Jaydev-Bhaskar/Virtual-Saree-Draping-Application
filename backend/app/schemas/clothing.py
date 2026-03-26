"""
Pydantic schemas for clothing inventory.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class ClothingType(str, Enum):
    SAREE = "saree"
    KURTA = "kurta"
    DRESS = "dress"
    LEHENGA = "lehenga"
    SUIT = "suit"
    BLOUSE = "blouse"
    GOWN = "gown"
    SHERWANI = "sherwani"
    OTHER = "other"


class Occasion(str, Enum):
    CASUAL = "casual"
    FORMAL = "formal"
    WEDDING = "wedding"
    PARTY = "party"
    FESTIVAL = "festival"
    OFFICE = "office"
    TRADITIONAL = "traditional"
    OTHER = "other"


class ClothingCreate(BaseModel):
    """Create clothing item request."""
    name: str = Field(..., min_length=1, max_length=200)
    type: ClothingType
    color: str = Field(..., min_length=1, max_length=50)
    occasion: Occasion
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, ge=0)
    brand: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Red Silk Banarasi Saree",
                "type": "saree",
                "color": "red",
                "occasion": "wedding",
                "description": "A beautiful red silk Banarasi saree with gold zari work",
                "price": 15000.00,
                "brand": "FabIndia",
                "tags": ["silk", "banarasi", "zari"],
            }
        }


class ClothingUpdate(BaseModel):
    """Update clothing item request."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[ClothingType] = None
    color: Optional[str] = Field(None, min_length=1, max_length=50)
    occasion: Optional[Occasion] = None
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, ge=0)
    brand: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None


class ClothingResponse(BaseModel):
    """Clothing item response."""
    id: str
    name: str
    type: str
    color: str
    occasion: str
    description: Optional[str] = None
    price: Optional[float] = None
    brand: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "65f1a2b3c4d5e6f7a8b9c0d1",
                "name": "Red Silk Banarasi Saree",
                "type": "saree",
                "color": "red",
                "occasion": "wedding",
                "description": "A beautiful red silk Banarasi saree",
                "price": 15000.00,
                "brand": "FabIndia",
                "tags": ["silk", "banarasi"],
                "image_url": "/uploads/clothing/saree_123.jpg",
                "created_at": "2024-03-15T10:30:00",
            }
        }


class ClothingListResponse(BaseModel):
    """Paginated clothing list response."""
    items: List[ClothingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
