import asyncio
import os
import sys
from bson import ObjectId

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import database

async def diagnose_user():
    await database.connect()
    user = await database.db.users.find_one({"email": "jaydev@gmail.com"})
    
    if not user:
        print("ERROR: User 'jaydev@gmail.com' not found in database.")
    else:
        u_id = user["_id"]
        print(f"DEBUG: Found user {user.get('username')} with ID: {u_id}")
        
        # Check all tryon results for this user
        count = await database.db.tryon_results.count_documents({"user_id": u_id})
        print(f"DEBUG: Try-on records found: {count}")
        
        # If count is 0, check if there are any results at all (maybe they are orphaned?)
        total_results = await database.db.tryon_results.count_documents({})
        print(f"DEBUG: Total results in DB (all users): {total_results}")
        
        if count == 0 and total_results > 0:
            print("WARNING: Results exist but NONE match this user ID.")
            sample = await database.db.tryon_results.find_one({})
            print(f"SAMPLE_RESULT_USER_ID: {sample.get('user_id')}")

    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(diagnose_user())
