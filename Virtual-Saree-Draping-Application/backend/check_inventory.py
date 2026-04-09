import asyncio
import sys
import os

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import database

async def check():
    await database.connect()
    count = await database.db.clothing.count_documents({})
    print(f"TOTAL_SAREES: {count}")
    
    occasions = ["wedding", "party", "casual", "festive"]
    for occ in occasions:
        c = await database.db.clothing.count_documents({"occasion": occ})
        print(f"OCCASION_{occ.upper()}: {c}")
        
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
