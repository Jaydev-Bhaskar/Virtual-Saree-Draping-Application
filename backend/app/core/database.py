"""
MongoDB async connection using Motor driver.
Provides database instance and collection accessors.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    """Async MongoDB database manager."""

    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    async def connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                maxPoolSize=50,
                minPoolSize=10,
                serverSelectionTimeoutMS=5000,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]
            # Verify connection
            await self.client.admin.command("ping")
            logger.info(
                f"Connected to MongoDB: {settings.MONGODB_DB_NAME}"
            )
            # Create indexes
            await self._create_indexes()
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def _create_indexes(self):
        """Create database indexes for performance."""
        try:
            # Users collection
            await self.db.users.create_index("email", unique=True)
            await self.db.users.create_index("username", unique=True)

            # Clothing collection
            await self.db.clothing.create_index("type")
            await self.db.clothing.create_index("color")
            await self.db.clothing.create_index("occasion")
            await self.db.clothing.create_index(
                [("type", 1), ("color", 1), ("occasion", 1)]
            )

            # Uploads collection
            await self.db.uploads.create_index("user_id")

            # Try-on results collection
            await self.db.tryon_results.create_index("user_id")
            await self.db.tryon_results.create_index("created_at")

            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")

    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def get_collection(self, name: str):
        """Get a collection by name."""
        return self.db[name]


# Singleton database instance
database = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency injection for database access."""
    return database.db
