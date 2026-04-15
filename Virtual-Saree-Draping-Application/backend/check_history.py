import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.database import database

async def check():
    await database.connect()
    docs = await database.db.tryon_results.find().sort('created_at', -1).limit(3).to_list(10)
    for index, d in enumerate(docs):
        print(f"Doc {index}: _id={d.get('_id')} type={d.get('type')} user_id={d.get('user_id')} img={d.get('generated_image_url')}")
    await database.disconnect()

asyncio.run(check())
