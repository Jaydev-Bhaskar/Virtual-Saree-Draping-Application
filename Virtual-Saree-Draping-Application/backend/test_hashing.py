from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("testpassword")
    print(f"SUCCESS: {h}")
except Exception as e:
    print(f"FAILURE: {e}")
