from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
import uuid

from app.core.database import database
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/")
async def create_lookbook(
    result_ids: List[str] = Body(..., embed=True),
    title: str = Body("My Fashion Lookbook", embed=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Creates a shareable lookbook from a list of try-on result IDs.
    Returns a unique shareable ID.
    """
    user_id = str(current_user["_id"])
    share_id = str(uuid.uuid4())[:12] # Short, clean shareable ID
    
    # Verify the results belong to the user
    valid_ids = []
    for rid in result_ids:
        try:
            res = await database.db.tryon_results.find_one({
                "_id": ObjectId(rid),
                "user_id": ObjectId(user_id)
            })
            if res:
                valid_ids.append(ObjectId(rid))
        except:
            continue
            
    if not valid_ids:
        raise HTTPException(status_code=400, detail="No valid try-on results selected.")
        
    lookbook_doc = {
        "share_id": share_id,
        "user_id": ObjectId(user_id),
        "title": title,
        "result_ids": valid_ids,
        "created_at": datetime.now(timezone.utc),
        "views": 0
    }
    
    await database.db.lookbooks.insert_one(lookbook_doc)
    
    return {"share_id": share_id, "share_url": f"/shared/{share_id}"}

@router.get("/{share_id}")
async def get_shared_lookbook(share_id: str):
    """
    Public endpoint to retrieve a lookbook by its share_id (No Login Required).
    """
    lookbook = await database.db.lookbooks.find_one({"share_id": share_id})
    if not lookbook:
        raise HTTPException(status_code=404, detail="Lookbook not found.")
        
    # Increment view count
    await database.db.lookbooks.update_one({"_id": lookbook["_id"]}, {"$inc": {"views": 1}})
    
    # Fetch all the associated results and their clothing data
    results = []
    for rid in lookbook["result_ids"]:
        res = await database.db.tryon_results.find_one({"_id": rid})
        if res:
            # Join with clothing info if available
            clothing = None
            if "clothing_id" in res:
                clothing = await database.db.clothing.find_one({"_id": res["clothing_id"]})
            
            # Clean for JSON
            res["_id"] = str(res["_id"])
            res["user_id"] = str(res["user_id"])
            if clothing: clothing["_id"] = str(clothing["_id"])
            
            res["clothing_info"] = clothing
            results.append(res)
            
    return {
        "title": lookbook.get("title", "Fashion Lookbook"),
        "created_at": lookbook["created_at"],
        "items": results
    }
