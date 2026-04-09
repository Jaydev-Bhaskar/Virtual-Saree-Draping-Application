import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Configuration
MONGO_URL = "mongodb://localhost:27017" # Default fallback
DB_NAME = "drapingapp"

# Mock Items from Inventory.jsx
MOCK_SAREES = [
  { "name": 'Crimson Banarasi Silk', "price": 12499, "type": 'saree', "tags": ["banarasi", "silk", "wedding"], "description": 'Experience the regal elegance of this authentic Crimson Banarasi Silk saree, featuring intricate gold zari work and a heavy border. Perfect for weddings and grand festive occasions.', "image_url": '/images/crimson_banarasi.png', "color": "Crimson", "occasion": "wedding" },
  { "name": 'Royal Blue Kanjivaram', "price": 18999, "type": 'saree', "tags": ["kanjivaram", "silk", "traditional"], "description": 'A masterpiece from Kanchipuram, this Royal Blue Kanjivaram silk saree boasts pure mulberry silk with traditional temple motifs woven in stunning silver and gold zari.', "image_url": '/images/royal_blue_kanjivaram.png', "color": "Royal Blue", "occasion": "wedding" },
  { "name": 'Emerald Organza', "price": 8599, "type": 'saree', "tags": ["organza", "party", "lightweight"], "description": 'Lightweight, sheer, and incredibly graceful. This Emerald Green Organza saree features delicate floral embroidery, making it a modern favorite for evening parties.', "image_url": '/images/emerald_organza.png', "color": "Emerald Green", "occasion": "party" },
  { "name": 'Lavender Chiffon', "price": 6499, "type": 'saree', "tags": ["chiffon", "daily", "elegant"], "description": 'Fluid and romantic, this Lavender Chiffon saree drapes beautifully around your silhouette. Finished with a minimalist sequin border for subtle nighttime glamour.', "image_url": '/images/lavender_chiffon.png', "color": "Lavender", "occasion": "party" },
  { "name": 'Golden Georgette', "price": 9999, "type": 'saree', "tags": ["georgette", "festive"], "description": 'Rich Golden Georgette fabric that offers effortless drape and subtle sheen. Handcrafted with meticulous gota patti work for a luxurious festive touch.', "image_url": '/images/golden_georgette.png', "color": "Golden", "occasion": "formal" },
  { "name": 'Magenta Silk', "price": 14999, "type": 'saree', "tags": ["silk", "magenta", "party"], "description": 'A vibrant Magenta pure silk drape that commands attention. Featuring an elaborate woven pallu and a classic smooth finish for traditional celebrations.', "image_url": '/images/magenta_silk.png', "color": "Magenta", "occasion": "wedding" },
  { "name": 'Midnight Velvet', "price": 16799, "type": 'saree', "tags": ["velvet", "winter", "wedding"], "description": 'Exquisite deep navy velvet saree adorned with intricate silver hand-embroidery. A regal choice for winter weddings and evening galas.', "image_url": '/images/midnight_velvet.png', "color": "Midnight Blue", "occasion": "wedding" },
  { "name": 'Pastel Peach Net', "price": 11299, "type": 'saree', "tags": ["net", "summer", "party"], "description": 'Ethereal peach net saree featuring delicate shimmering floral sequins and a thin champagne border. Light as air and perfect for summer celebrations.', "image_url": '/images/peach_net.png', "color": "Pastel Peach", "occasion": "party" },
  { "name": 'Turquoise Patola Silk', "price": 22500, "type": 'saree', "tags": ["patola", "silk", "gujarat"], "description": 'A vibrant Turquoise traditional Patola silk saree from Gujarat. Boasts hand-woven geometric patterns and a rich gold zari border.', "image_url": '/images/turquoise_patola.png', "color": "Turquoise", "occasion": "wedding" },
]

async def seed():
    # Attempt to read from .env if available
    mongo_uri = MONGO_URL
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if line.startswith("MONGODB_URL="):
                    mongo_uri = line.split("=", 1)[1].strip().strip('"')

    client = AsyncIOMotorClient(mongo_uri)
    db = client[DB_NAME]
    clothing = db.clothing

    print(f"Connecting to {mongo_uri}...")
    
    # Clear existing clothing
    await clothing.delete_many({})
    print("Cleared existing clothing collection.")

    # Insert mock sarees
    for saree in MOCK_SAREES:
        saree["created_at"] = datetime.now(timezone.utc)
        saree["updated_at"] = datetime.now(timezone.utc)
        saree["brand"] = "VirtualFashion"
    
    result = await clothing.insert_many(MOCK_SAREES)
    print(f"Successfully seeded {len(result.inserted_ids)} sarees.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
