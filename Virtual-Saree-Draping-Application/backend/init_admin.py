import asyncio
from app.core.database import database
from app.core.security import hash_password

async def main():
    await database.connect()
    email = "admin@ethnika.com"
    pwd = hash_password("admin123")
    
    # Try to find existing
    existing = await database.db.users.find_one({"email": email})
    
    if existing:
        await database.db.users.update_one(
            {"email": email},
            {"$set": {"role": "admin", "password_hash": pwd}}
        )
        print(f"Updated existing user {email} to Admin with password 'admin123'")
    else:
        new_admin = {
            "full_name": "System Admin",
            "email": email,
            "username": "admin_root",
            "password_hash": pwd,
            "role": "admin",
            "created_at": "2026-04-09"
        }
        await database.db.users.insert_one(new_admin)
        print(f"Created NEW Admin account: {email} with password 'admin123'")
    
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
