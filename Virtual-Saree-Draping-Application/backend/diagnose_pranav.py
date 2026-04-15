import asyncio
import os
import sys
from bson import ObjectId

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.database import database

async def diagnose():
    await database.connect()
    
    # 1. Find Pranav's User ID
    user = await database.db.users.find_one({"email": "pranva@gmail.com"})
    if not user:
        print("User pranva@gmail.com NOT FOUND in database.")
        return
    
    user_id = user["_id"]
    print(f"Found User: {user['full_name']} | Email: {user['email']} | ID: {user_id}")
    
    # 2. Check for try-on records for THIS user
    count = await database.db.tryon_results.count_documents({"user_id": user_id})
    print(f"Direct Try-On Records for this User ID: {count}")
    
    # 3. Check for records with NO user_id (Lost records)
    lost_count = await database.db.tryon_results.count_documents({"user_id": {"$exists": False}})
    print(f"Orphaned Records (No User ID): {lost_count}")
    
    # 4. Check for records assigned to 'jaydev' or other previous IDs
    # (Sometimes during development, records get stuck to a hardcoded ID)
    other_records = await database.db.tryon_results.count_documents({"user_id": {"$ne": user_id}})
    print(f"Records assigned to OTHER User IDs: {other_records}")

    # 5. Show exactly what the Dashboard sees for this user
    docs = await database.db.tryon_results.find({"user_id": user_id}).sort("created_at", -1).limit(5).to_list(10)
    for d in docs:
        print(f" - Found Doc: {d.get('_id')} | Date: {d.get('created_at')} | Image: {d.get('generated_image_url')}")

    await database.disconnect()

asyncio.run(diagnose())
