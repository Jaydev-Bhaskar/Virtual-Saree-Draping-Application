
import asyncio
from app.core.database import database
from bson import ObjectId

async def check_users():
    await database.connect()
    users = await database.db.users.find().to_list(length=100)
    print("\n--- Current Users in Database ---")
    for u in users:
        print(f"User: {u.get('username')} | Email: {u.get('email')} | Role: {u.get('role')}")
    print("---------------------------------\n")
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(check_users())
