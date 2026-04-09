from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FeedbackCreate(BaseModel):
    clothing_id: str = Field(..., description="ID of the saree being reviewed")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, description="User comments/feedback")

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    username: str
    clothing_id: str
    rating: int
    comment: Optional[str]
    created_at: str

class FeedbackListResponse(BaseModel):
    feedbacks: List[FeedbackResponse]
    average_rating: float
    total_count: int
