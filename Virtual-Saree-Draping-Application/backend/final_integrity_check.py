import asyncio
import os
import sys
import logging

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import database
from app.services.tryon_engine import tryon_engine_service

# Setup logging to see everything
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IntegrityCheck")

async def integrity_check():
    try:
        logger.info("Connecting to Database...")
        await database.connect()
        
        user_photo = "uploads/temp_user_photo.jpg"
        
        # 1. Check Wedding Suggestion
        logger.info("TEST 1: Wedding Suggestion...")
        wedding = await tryon_engine_service.generate_suggestion(user_photo, "wedding")
        logger.info(f"WEDDING_OK: {wedding['style']} selected. Output: {wedding['image_url']}")
        
        # 2. Check Party Suggestion (Should pick Lavender Chiffon if possible)
        logger.info("TEST 2: Party Suggestion...")
        party = await tryon_engine_service.generate_suggestion(user_photo, "party")
        logger.info(f"PARTY_OK: {party['style']} selected. Output: {party['image_url']}")
        
        print("\n=== SYSTEM INTEGRITY REPORT ===")
        print(f"Wedding Case: PASSED ({wedding['style']})")
        print(f"Party Case:   PASSED ({party['style']})")
        print("Final Verdict: System is ONLINE and healthy.")
        
    except Exception as e:
        logger.error(f"INTEGRITY CHECK FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(integrity_check())
