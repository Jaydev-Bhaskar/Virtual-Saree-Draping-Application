import httpx
import logging
import asyncio
from typing import Optional, Union, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

class ExternalTryonAPI:
    def __init__(self):
        self.api_key = settings.EXTERNAL_TRYON_API_KEY
        self.api_url = settings.EXTERNAL_TRYON_API_URL
        self.timeout = httpx.Timeout(90.0, connect=30.0)

    async def generate_tryon(self, user_image_path: str, clothing_image_path: str) -> Optional[bytes]:
        """
        Send a request to the external API using HTTP multipart form.
        Accepts file paths and returns the generated image bytes.
        Implements 1 retry mechanisms.
        """
        if not self.api_key or not self.api_url:
            logger.warning("External Try-On API credentials not set.")
            return None

        # 1 Retry => 2 attempts
        for attempt in range(2):
            try:
                logger.info(f"External API attempt {attempt + 1}: Starting request to {self.api_url}")
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    headers = {
                        "x-api-key": self.api_key,
                        "Authorization": f"Bearer {self.api_key}"
                    }
                    
                    with open(user_image_path, "rb") as u_img, open(clothing_image_path, "rb") as c_img:
                        files = {
                            "user_image": ("user_image.jpg", u_img, "image/jpeg"),
                            "clothing_image": ("clothing.jpg", c_img, "image/jpeg")
                        }
                        data = {"model": "default"}
                        
                        response = await client.post(
                            self.api_url,
                            headers=headers,
                            files=files,
                            data=data
                        )
                        
                        if response.status_code == 200:
                            logger.info("External API request successful.")
                            content_type = response.headers.get("content-type", "")
                            
                            if "json" in content_type:
                                res_data = response.json()
                                if "image_url" in res_data:
                                    img_url = res_data["image_url"]
                                    img_resp = await client.get(img_url, timeout=self.timeout)
                                    return img_resp.content
                                else:
                                    logger.error("API returned JSON without 'image_url'")
                                    return None
                            else:
                                # Assume binary image output
                                return response.content
                        else:
                            logger.error(f"External API failed: {response.status_code} - {response.text}")
            
            except httpx.RequestError as e:
                logger.warning(f"External HTTP request error: {e}")
            except Exception as e:
                logger.error(f"External API integration error: {e}", exc_info=True)
            
            if attempt < 1:
                logger.info("Waiting 3 seconds before retry...")
                await asyncio.sleep(3)
        
        logger.error("External Try-On API failed after retries.")
        return None

external_tryon_api = ExternalTryonAPI()
