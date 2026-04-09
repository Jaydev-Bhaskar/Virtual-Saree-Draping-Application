import asyncio
from app.api.auth import signup
from app.schemas.auth import UserSignup
from app.core.database import database

async def test():
    await database.connect()
    
    user = UserSignup(
        username="testcrash",
        email="crash@gmail.com",
        password="password123",
        full_name="Crash Tester"
    )
    try:
        res = await signup(user)
        print("Success!", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
