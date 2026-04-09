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
logger = logging.getLogger("Diagnostic")

async def diagnose():
    try:
        logger.info("Connecting to Database...")
        await database.connect()
        
        user_photo = "uploads/temp_user_photo.jpg"
        occasion = "wedding"
        
        logger.info(f"Triggering Suggestion for {occasion}...")
        result = await tryon_engine_service.generate_suggestion(user_photo, occasion)
        
        logger.info("SUCCESS! Result generated:")
        print(result)
        
    except Exception as e:
        logger.error("DIAGNOSTIC FAILED!")
        logger.error(f"Error Type: {type(e).__name__}")
        logger.error(f"Error Message: {str(e)}")
        # Print full traceback
        import traceback
        traceback.print_exc()
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(diagnose())
