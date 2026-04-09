from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import database
from app.core.security import get_current_user
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackListResponse
from bson import ObjectId
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback: FeedbackCreate,
    current_user: dict = Depends(get_current_user)
):
    """Submit feedback for a specific saree."""
    feedback_doc = {
        "user_id": ObjectId(str(current_user["_id"])),
        "username": current_user["username"],
        "clothing_id": ObjectId(feedback.clothing_id),
        "rating": feedback.rating,
        "comment": feedback.comment,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await database.db.feedback.insert_one(feedback_doc)
    
    return FeedbackResponse(
        id=str(result.inserted_id),
        user_id=str(feedback_doc["user_id"]),
        username=feedback_doc["username"],
        clothing_id=str(feedback_doc["clothing_id"]),
        rating=feedback_doc["rating"],
        comment=feedback_doc["comment"],
        created_at=str(feedback_doc["created_at"])
    )

@router.get("/{clothing_id}", response_model=FeedbackListResponse)
async def get_saree_feedback(clothing_id: str):
    """Retrieve all feedback for a specific saree."""
    cursor = database.db.feedback.find({"clothing_id": ObjectId(clothing_id)}).sort("created_at", -1)
    feedbacks = await cursor.to_list(length=100)
    
    fb_responses = [
        FeedbackResponse(
            id=str(f["_id"]),
            user_id=str(f["user_id"]),
            username=f["username"],
            clothing_id=str(f["clothing_id"]),
            rating=f["rating"],
            comment=f.get("comment"),
            created_at=str(f["created_at"])
        ) for f in feedbacks
    ]
    
    total = len(fb_responses)
    avg_rating = sum(f.rating for f in fb_responses) / total if total > 0 else 0
    
    return FeedbackListResponse(
        feedbacks=fb_responses,
        average_rating=round(avg_rating, 1),
        total_count=total
    )
