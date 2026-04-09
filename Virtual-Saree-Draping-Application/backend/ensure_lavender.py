import asyncio
import os
import sys

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import database

async def check():
    await database.connect()
    item = await database.db.clothing.find_one({"name": {"$regex": "Lavender", "$options": "i"}})
    if item:
        print(f"FOUND: {item['name']} (Occasion: {item.get('occasion')})")
    else:
        print("NOT_FOUND: Lavender Saree missing")
        # Add a sample Lavender Chiffon saree to make sure it exists
        new_item = {
            "name": "Lavender Chiffon Saree",
            "price": 4500.0,
            "color": "Lavender",
            "type": "saree",
            "occasion": "party",
            "description": "An elegant Lavender Chiffon saree with soft shimmering borders. Perfect for evening parties and receptions.",
            "brand": "Ethnika Premium",
            "tags": ["Lavender", "Chiffon", "Party"],
            "image_url": "clothing/lavender_chiffon.png",
            "file_path": "uploads/clothing/lavender_chiffon.png"
        }
        # Insert or update
        await database.db.clothing.update_one(
            {"name": new_item["name"]},
            {"$set": new_item},
            upsert=True
        )
        print("ADDED: Lavender Chiffon Saree added to collection")
        
    await database.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
