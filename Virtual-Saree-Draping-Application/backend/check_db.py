import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["virtual_fashion"]
    count = await db.clothing.count_documents({})
    print(f"COUNT: {count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
