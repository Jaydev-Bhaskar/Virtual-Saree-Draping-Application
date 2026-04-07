"""
Rate limiting middleware.
Uses Redis if available, otherwise falls back to in-memory storage.
Limits: 10 requests per minute per user/IP.
"""

import time
from collections import defaultdict
from typing import Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# In-memory rate limit store: {key: [(timestamp, ...),]}
_rate_limit_store: dict = defaultdict(list)

RATE_LIMIT_MAX = 10  # requests
RATE_LIMIT_WINDOW = 60  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware: 10 requests/min per user or IP."""

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and docs
        if request.url.path in ("/", "/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        # Determine rate limit key
        key = self._get_rate_limit_key(request)

        if settings.use_redis:
            is_limited = await self._check_redis_rate_limit(key)
        else:
            is_limited = self._check_memory_rate_limit(key)

        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 10 requests per minute.",
            )

        response = await call_next(request)
        return response

    def _get_rate_limit_key(self, request: Request) -> str:
        """Extract rate limit key from request (user ID or IP)."""
        # Try to get user from authorization header
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            try:
                from app.core.security import decode_access_token
                payload = decode_access_token(token)
                user_id = payload.get("sub")
                if user_id:
                    return f"rate_limit:user:{user_id}"
            except Exception:
                pass

        # Fallback to client IP
        client_ip = request.client.host if request.client else "unknown"
        return f"rate_limit:ip:{client_ip}"

    def _check_memory_rate_limit(self, key: str) -> bool:
        """In-memory rate limit check."""
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW

        # Clean old entries
        _rate_limit_store[key] = [
            ts for ts in _rate_limit_store[key] if ts > window_start
        ]

        if len(_rate_limit_store[key]) >= RATE_LIMIT_MAX:
            return True

        _rate_limit_store[key].append(now)
        return False

    async def _check_redis_rate_limit(self, key: str) -> bool:
        """Redis-based rate limit check."""
        try:
            import redis.asyncio as aioredis

            r = aioredis.from_url(settings.REDIS_URL)
            pipe = r.pipeline()
            now = time.time()

            pipe.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, RATE_LIMIT_WINDOW)

            results = await pipe.execute()
            count = results[2]
            await r.close()

            return count > RATE_LIMIT_MAX
        except Exception as e:
            logger.warning(f"Redis rate limit error, falling back to memory: {e}")
            return self._check_memory_rate_limit(key)
