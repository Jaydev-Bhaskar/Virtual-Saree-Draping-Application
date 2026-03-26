"""
AI Recommendation service.
Uses Gemini API if configured, otherwise returns intelligent mock recommendations.
"""

import random
import asyncio
from typing import List, Optional, Dict
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AIRecommendationService:
    """AI-powered outfit recommendation engine."""

    # Style knowledge base for mock recommendations
    OCCASION_STYLES = {
        "wedding": {
            "best_types": ["saree", "lehenga", "sherwani", "gown"],
            "best_colors": ["red", "gold", "maroon", "pink", "navy"],
            "tips": [
                "Rich fabrics like silk and velvet work best for weddings",
                "Gold jewelry complements traditional wedding attire",
                "Consider the time of day - lighter colors for day, deeper for evening",
                "Embroidered or embellished pieces add a festive touch",
            ],
        },
        "casual": {
            "best_types": ["kurta", "dress", "blouse"],
            "best_colors": ["blue", "white", "green", "yellow", "pink"],
            "tips": [
                "Cotton and linen fabrics keep you comfortable",
                "Mix and match with accessories for variety",
                "Comfortable footwear completes the casual look",
                "Light, breathable colors work well for daytime",
            ],
        },
        "formal": {
            "best_types": ["suit", "dress", "saree", "gown"],
            "best_colors": ["black", "navy", "white", "grey", "maroon"],
            "tips": [
                "Well-fitted clothing makes a strong impression",
                "Minimalist accessories keep the look professional",
                "Monochromatic outfits create an elegant silhouette",
                "Quality fabric elevates any formal outfit",
            ],
        },
        "party": {
            "best_types": ["dress", "lehenga", "gown"],
            "best_colors": ["black", "red", "gold", "purple", "pink"],
            "tips": [
                "Sequins and metallic accents add party glamour",
                "Bold colors make you stand out",
                "Statement jewelry elevates the outfit",
                "Consider the venue when choosing heel height",
            ],
        },
        "festival": {
            "best_types": ["saree", "kurta", "lehenga"],
            "best_colors": ["yellow", "orange", "red", "green", "gold"],
            "tips": [
                "Traditional prints and patterns suit festive occasions",
                "Bright, vibrant colors reflect the festive spirit",
                "Layer with dupattas or stoles for versatility",
                "Comfortable yet elegant is the key for long celebrations",
            ],
        },
        "office": {
            "best_types": ["suit", "kurta", "dress", "blouse"],
            "best_colors": ["navy", "grey", "white", "blue", "black"],
            "tips": [
                "Keep patterns subtle and professional",
                "Wrinkle-free fabrics maintain a polished look",
                "Neutral tones offer maximum mix-and-match potential",
                "Structured silhouettes project confidence",
            ],
        },
        "traditional": {
            "best_types": ["saree", "kurta", "lehenga", "sherwani"],
            "best_colors": ["red", "gold", "green", "orange", "maroon"],
            "tips": [
                "Handloom and handwoven fabrics add authenticity",
                "Regional specialties showcase cultural heritage",
                "Traditional motifs and borders enhance the look",
                "Matching accessories complete the ethnic ensemble",
            ],
        },
    }

    async def get_recommendations(
        self,
        clothing_items: List[dict],
        occasion: Optional[str] = None,
        preferred_colors: Optional[List[str]] = None,
        preferred_types: Optional[List[str]] = None,
        budget_min: Optional[float] = None,
        budget_max: Optional[float] = None,
    ) -> dict:
        """
        Generate AI-based outfit recommendations.
        Uses Gemini API if available, otherwise mock intelligence.
        """
        if settings.GEMINI_API_KEY:
            return await self._get_gemini_recommendations(
                clothing_items, occasion, preferred_colors,
                preferred_types, budget_min, budget_max
            )
        else:
            return await self._get_mock_recommendations(
                clothing_items, occasion, preferred_colors,
                preferred_types, budget_min, budget_max
            )

    async def _get_gemini_recommendations(
        self,
        clothing_items: List[dict],
        occasion: Optional[str],
        preferred_colors: Optional[List[str]],
        preferred_types: Optional[List[str]],
        budget_min: Optional[float],
        budget_max: Optional[float],
    ) -> dict:
        """Call Gemini API for recommendations (mock implementation)."""
        try:
            import httpx

            # Prepare prompt
            items_text = "\n".join(
                f"- {item.get('name')}: {item.get('type')}, {item.get('color')}, "
                f"₹{item.get('price', 'N/A')}, for {item.get('occasion')}"
                for item in clothing_items
            )

            prompt = f"""You are a fashion stylist AI. Based on the following clothing items,
recommend the best outfit for {'a ' + occasion + ' event' if occasion else 'any occasion'}.

Available items:
{items_text}

Preferences:
- Colors: {', '.join(preferred_colors) if preferred_colors else 'Any'}
- Types: {', '.join(preferred_types) if preferred_types else 'Any'}
- Budget: ₹{budget_min or 0} - ₹{budget_max or 'Unlimited'}

Provide:
1. Best outfit recommendation with reasoning
2. Alternative suggestions
3. Styling tips
4. Occasion match analysis"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1/models/"
                    f"gemini-pro:generateContent?key={settings.GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 1024,
                        },
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    text = (
                        data.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "")
                    )
                    # Parse AI response into structured format
                    return self._parse_ai_response(text, clothing_items, occasion)
                else:
                    logger.warning(
                        f"Gemini API error {response.status_code}, using mock"
                    )
                    return await self._get_mock_recommendations(
                        clothing_items, occasion, preferred_colors,
                        preferred_types, budget_min, budget_max
                    )

        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return await self._get_mock_recommendations(
                clothing_items, occasion, preferred_colors,
                preferred_types, budget_min, budget_max
            )

    def _parse_ai_response(
        self, ai_text: str, items: List[dict], occasion: Optional[str]
    ) -> dict:
        """Parse Gemini response into structured recommendation."""
        # Fallback to mock-style response with AI text as analysis
        scored_items = self._score_items(items, occasion, [], [])

        best = scored_items[0] if scored_items else None
        return {
            "best_outfit": self._format_suggestion(best["item"], best["score"]),
            "alternatives": [
                self._format_suggestion(s["item"], s["score"])
                for s in scored_items[1:4]
            ],
            "occasion_match": occasion or "general",
            "styling_tips": [
                {"category": "AI Analysis", "tip": ai_text[:500], "priority": "high"}
            ],
            "overall_analysis": ai_text[:300],
        }

    async def _get_mock_recommendations(
        self,
        clothing_items: List[dict],
        occasion: Optional[str],
        preferred_colors: Optional[List[str]],
        preferred_types: Optional[List[str]],
        budget_min: Optional[float],
        budget_max: Optional[float],
    ) -> dict:
        """Generate intelligent mock recommendations."""
        await asyncio.sleep(random.uniform(0.2, 0.5))  # Simulate processing

        if not clothing_items:
            return {
                "best_outfit": None,
                "alternatives": [],
                "occasion_match": "No items available",
                "styling_tips": [],
                "overall_analysis": "No clothing items found matching your criteria.",
            }

        # Score each item
        scored_items = self._score_items(
            clothing_items, occasion, preferred_colors or [],
            preferred_types or []
        )

        # Filter by budget
        if budget_min is not None or budget_max is not None:
            scored_items = [
                s for s in scored_items
                if self._in_budget(s["item"], budget_min, budget_max)
            ]

        if not scored_items:
            scored_items = self._score_items(
                clothing_items, occasion, preferred_colors or [],
                preferred_types or []
            )

        best = scored_items[0]
        alternatives = scored_items[1:4]

        # Get styling tips
        target_occasion = occasion or "casual"
        style_info = self.OCCASION_STYLES.get(
            target_occasion, self.OCCASION_STYLES["casual"]
        )
        tips = random.sample(style_info["tips"], min(3, len(style_info["tips"])))

        styling_tips = [
            {
                "category": cat,
                "tip": tip,
                "priority": priority,
            }
            for cat, tip, priority in zip(
                ["Color Coordination", "Fabric Choice", "Accessories"],
                tips,
                ["high", "medium", "low"],
            )
        ]

        # Generate analysis
        analysis = (
            f"Based on your preferences for {target_occasion} occasions, "
            f"'{best['item'].get('name', 'the top pick')}' is the strongest match "
            f"with a {best['score']}% compatibility score. "
            f"The {best['item'].get('color', '')} {best['item'].get('type', '')} "
            f"aligns well with {target_occasion} dress codes."
        )

        return {
            "best_outfit": self._format_suggestion(best["item"], best["score"]),
            "alternatives": [
                self._format_suggestion(s["item"], s["score"])
                for s in alternatives
            ],
            "occasion_match": (
                f"{'Excellent' if best['score'] > 85 else 'Good' if best['score'] > 70 else 'Moderate'} "
                f"match for {target_occasion} events"
            ),
            "styling_tips": styling_tips,
            "overall_analysis": analysis,
        }

    def _score_items(
        self,
        items: List[dict],
        occasion: Optional[str],
        preferred_colors: List[str],
        preferred_types: List[str],
    ) -> List[dict]:
        """Score clothing items based on preferences."""
        scored = []
        style_info = self.OCCASION_STYLES.get(
            occasion or "casual", self.OCCASION_STYLES["casual"]
        )

        for item in items:
            score = 50  # Base score

            # Occasion match
            if item.get("occasion") == occasion:
                score += 20
            elif item.get("type") in style_info["best_types"]:
                score += 15

            # Color match
            if item.get("color", "").lower() in [
                c.lower() for c in style_info["best_colors"]
            ]:
                score += 15

            # User preference matches
            if preferred_colors and item.get("color", "").lower() in [
                c.lower() for c in preferred_colors
            ]:
                score += 10

            if preferred_types and item.get("type", "").lower() in [
                t.lower() for t in preferred_types
            ]:
                score += 10

            # Add some randomness for variety
            score += random.randint(-5, 5)
            score = max(0, min(100, score))

            scored.append({"item": item, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

    def _format_suggestion(self, item: dict, score: int) -> dict:
        """Format a clothing item as a suggestion."""
        reasons = []
        if score >= 85:
            reasons.append("Perfect match for the occasion")
        elif score >= 70:
            reasons.append("Great color and style combination")
        else:
            reasons.append("Versatile option worth considering")

        return {
            "clothing_id": str(item.get("_id", "")),
            "clothing_name": item.get("name", "Unknown"),
            "clothing_type": item.get("type", "unknown"),
            "color": item.get("color", "unknown"),
            "price": item.get("price"),
            "image_url": item.get("image_url"),
            "match_score": float(score),
            "reason": reasons[0],
        }

    def _in_budget(
        self, item: dict, budget_min: Optional[float], budget_max: Optional[float]
    ) -> bool:
        """Check if item is within budget range."""
        price = item.get("price")
        if price is None:
            return True
        if budget_min and price < budget_min:
            return False
        if budget_max and price > budget_max:
            return False
        return True


# Singleton
ai_recommendation_service = AIRecommendationService()
