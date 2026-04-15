import asyncio
import os
import sys
from bson import ObjectId

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import database

async def reconcile_history():
    await database.connect()
    
    # Target User
    user = await database.db.users.find_one({"email": "jaydev@gmail.com"})
    if not user:
        print("ERROR: User not found.")
        return
        
    u_id = user["_id"]
    print(f"Reconciling for User ID: {u_id}")
    
    # Find all tryon_results that have a DIFFERENT user_id (the ones we found earlier)
    # We'll re-assign them to Jaydev so he can see them in his dashboard
    result = await database.db.tryon_results.update_many(
        {"user_id": {"$ne": u_id}},
        {"$set": {"user_id": u_id}}
    )
    
    print(f"SUCCESS: {result.modified_count} history records reconnected to Jaydev's account.")
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(reconcile_history())
