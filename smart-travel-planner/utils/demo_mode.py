"""Demo mode: provides mock AI responses when no OpenAI API key is configured."""

from __future__ import annotations

import json
import random

DEMO_CHAT_RESPONSES: dict[str, str] = {
    "paris": (
        "**Paris is a wonderful choice!** Here's what I'd recommend:\n\n"
        "**Top Attractions:**\n"
        "- Eiffel Tower - Visit at sunset for the best experience ($28 entry)\n"
        "- Louvre Museum - Allow at least 3-4 hours ($17 entry)\n"
        "- Montmartre & Sacre-Coeur - Free to visit, stunning city views\n"
        "- Seine River Cruise - Romantic evening activity (~$15)\n\n"
        "**Food Recommendations:**\n"
        "- Try a classic croissant at Du Pain et des Idees\n"
        "- Visit Le Marais for falafel at L'As du Fallafel\n"
        "- Dinner at a bistro in Saint-Germain-des-Pres\n\n"
        "**Budget Estimate (per person/day):**\n"
        "- Budget: $80-120 | Moderate: $150-250 | Luxury: $400+\n\n"
        "**Travel Tip:** Get a Paris Museum Pass for 2 or 4 days to save on attractions!\n\n"
        "*This is a demo response. Add an OpenAI API key for personalized AI answers.*"
    ),
    "tokyo": (
        "**Tokyo is an incredible destination!** Here's my guide:\n\n"
        "**Must-Visit Areas:**\n"
        "- Shibuya Crossing & Shibuya Sky observation deck\n"
        "- Senso-ji Temple in Asakusa - Tokyo's oldest temple\n"
        "- Akihabara - Electric Town for anime & tech fans\n"
        "- Meiji Shrine in Harajuku - Peaceful oasis\n\n"
        "**Food Highlights:**\n"
        "- Tsukiji Outer Market for fresh sushi ($10-30)\n"
        "- Ramen at Ichiran or Fuunji (under $10)\n"
        "- Conveyor belt sushi at Genki Sushi\n\n"
        "**Budget Estimate (per person/day):**\n"
        "- Budget: $60-100 | Moderate: $120-200 | Luxury: $350+\n\n"
        "**Travel Tip:** Get a Suica/Pasmo card for seamless public transit!\n\n"
        "*This is a demo response. Add an OpenAI API key for personalized AI answers.*"
    ),
    "bali": (
        "**Bali is paradise!** Here's what to plan:\n\n"
        "**Must-See Spots:**\n"
        "- Uluwatu Temple - Stunning clifftop temple with sunset Kecak dance\n"
        "- Tegallalang Rice Terraces in Ubud\n"
        "- Tanah Lot Temple - Iconic sea temple\n"
        "- Seminyak Beach for sunsets\n\n"
        "**Food & Culture:**\n"
        "- Try nasi goreng and satay at local warungs ($2-5)\n"
        "- Visit Ubud Art Market for souvenirs\n"
        "- Take a Balinese cooking class (~$25)\n\n"
        "**Budget Estimate (per person/day):**\n"
        "- Budget: $30-50 | Moderate: $80-150 | Luxury: $300+\n\n"
        "**Travel Tip:** Rent a scooter for flexibility ($5/day) but be careful in traffic!\n\n"
        "*This is a demo response. Add an OpenAI API key for personalized AI answers.*"
    ),
    "default": (
        "**Great destination choice!** Here are some general travel planning tips:\n\n"
        "**Planning Checklist:**\n"
        "- Research visa requirements and travel advisories\n"
        "- Book flights 6-8 weeks in advance for best prices\n"
        "- Reserve accommodations in central locations\n"
        "- Get travel insurance for peace of mind\n\n"
        "**Smart Travel Tips:**\n"
        "- Use public transportation to save money and see more\n"
        "- Try local street food for authentic experiences\n"
        "- Visit major attractions early morning to avoid crowds\n"
        "- Learn a few basic phrases in the local language\n\n"
        "**Budget Framework (per person/day):**\n"
        "- Budget: $50-100 | Moderate: $100-250 | Luxury: $300+\n\n"
        "I can provide more specific recommendations for popular destinations like "
        "Paris, Tokyo, Bali, Rome, London, Bangkok, Barcelona, Sydney, Dubai, and New York.\n\n"
        "*This is a demo response. Add an OpenAI API key for personalized AI answers.*"
    ),
    "weather": (
        "Here's the current weather information I found:\n\n"
        "{weather_info}\n\n"
        "**Packing Tips Based on Weather:**\n"
        "- Bring layers for temperature changes\n"
        "- Pack a light rain jacket just in case\n"
        "- Comfortable walking shoes are essential\n\n"
        "*This is a demo response using simulated weather data. "
        "Add an OpenAI API key for real-time AI analysis.*"
    ),
    "pricing": (
        "Here are the estimated travel costs I found:\n\n"
        "{pricing_info}\n\n"
        "**Money-Saving Tips:**\n"
        "- Book flights on Tuesdays for lower fares\n"
        "- Consider hostels or Airbnb for budget stays\n"
        "- Eat where locals eat for authentic, affordable meals\n\n"
        "*This is a demo response using simulated pricing data. "
        "Add an OpenAI API key for personalized budget analysis.*"
    ),
}


def get_demo_chat_response(user_message: str) -> str:
    msg_lower = user_message.lower()

    if any(w in msg_lower for w in ["weather", "temperature", "forecast", "climate"]):
        from utils.function_calling import get_weather
        for city in ["paris", "tokyo", "london", "bali", "rome", "bangkok",
                      "barcelona", "sydney", "dubai", "new york"]:
            if city in msg_lower:
                data = get_weather(city.title())
                weather_info = (
                    f"**{data['location']}:** {data['temperature_celsius']}°C "
                    f"({data['temperature_fahrenheit']}°F) - {data['condition']}\n"
                    f"- Humidity: {data['humidity']}%\n"
                    f"- Wind: {data['wind_speed_kmh']} km/h"
                )
                return DEMO_CHAT_RESPONSES["weather"].format(weather_info=weather_info)
        return DEMO_CHAT_RESPONSES["default"]

    if any(w in msg_lower for w in ["cost", "price", "budget", "expensive", "cheap", "afford"]):
        from utils.function_calling import get_pricing
        for city in ["paris", "tokyo", "london", "bali", "rome", "bangkok",
                      "barcelona", "sydney", "dubai", "new york"]:
            if city in msg_lower:
                data = get_pricing(city.title(), num_days=5)
                pricing_info = (
                    f"**{data['destination']} (5-day trip estimate):**\n"
                    f"- Flight: {data['flight_estimate']}\n"
                    f"- Hotel: {data['hotel_per_night']}/night\n"
                    f"- Meals: {data['meal_average']}/meal\n"
                    f"- Budget total: {data['budget_total']} | "
                    f"Moderate: {data['moderate_total']} | "
                    f"Luxury: {data['luxury_total']}"
                )
                return DEMO_CHAT_RESPONSES["pricing"].format(pricing_info=pricing_info)
        return DEMO_CHAT_RESPONSES["default"]

    for city in ["paris", "tokyo", "bali"]:
        if city in msg_lower:
            return DEMO_CHAT_RESPONSES[city]

    return DEMO_CHAT_RESPONSES["default"]


DEMO_PHOTO_ANALYSIS = """**Location Identified:** This appears to be a scenic travel destination.

**Landmarks Visible:** The image shows architectural or natural features typical of a popular tourist area.

**Scene Description:** The photo captures a vibrant scene that would appeal to travelers looking for cultural experiences and memorable sights.

**Travel Tips:**
- Visit early in the morning for fewer crowds and better photos
- Check local opening hours and seasonal schedules
- Consider hiring a local guide for deeper cultural insights

**Best Time to Visit:** Spring (March-May) or Fall (September-November) typically offer the best weather and smaller crowds.

**Nearby Attractions:**
- Local museums and cultural centers
- Traditional markets and food streets
- Parks and scenic viewpoints

**Estimated Daily Budget:** $80-200 per person depending on your travel style.

*This is a demo analysis. Add an OpenAI API key for real GPT-4 Vision-powered photo analysis that identifies specific locations, landmarks, and provides tailored recommendations.*"""


def get_demo_itinerary(destination: str, num_days: int, budget_level: str,
                       travel_style: str, num_travelers: int,
                       interests: list[str]) -> dict:
    dest_data = {
        "paris": {
            "lat": 48.8566, "lon": 2.3522,
            "attractions": [
                ("Eiffel Tower", "Iconic iron lattice tower with stunning city views", 48.8584, 2.2945),
                ("Louvre Museum", "World's largest art museum, home to the Mona Lisa", 48.8606, 2.3376),
                ("Notre-Dame Cathedral", "Gothic masterpiece on Ile de la Cite", 48.8530, 2.3499),
                ("Montmartre & Sacre-Coeur", "Bohemian hilltop neighborhood with basilica", 48.8867, 2.3431),
                ("Musee d'Orsay", "Impressionist art in a former railway station", 48.8600, 2.3266),
                ("Arc de Triomphe", "Napoleon's triumphal arch at Place Charles de Gaulle", 48.8738, 2.2950),
            ],
            "restaurants": [
                ("Le Petit Cler", "Charming bistro with classic French cuisine", 48.8570, 2.3060),
                ("L'As du Fallafel", "Best falafel in the Marais district", 48.8571, 2.3588),
                ("Cafe de Flore", "Historic Left Bank cafe, perfect for people-watching", 48.8540, 2.3326),
                ("Breizh Cafe", "Authentic Breton crepes and galettes", 48.8614, 2.3617),
            ],
        },
        "tokyo": {
            "lat": 35.6762, "lon": 139.6503,
            "attractions": [
                ("Senso-ji Temple", "Tokyo's oldest and most significant temple", 35.7148, 139.7967),
                ("Shibuya Crossing", "World's busiest pedestrian crossing", 35.6595, 139.7004),
                ("Meiji Shrine", "Serene Shinto shrine in a forested area", 35.6764, 139.6993),
                ("Tokyo Skytree", "634m broadcasting tower with observation decks", 35.7101, 139.8107),
                ("Akihabara", "Electric Town - anime, manga, and electronics", 35.7023, 139.7745),
                ("Tsukiji Outer Market", "Fresh seafood and street food paradise", 35.6654, 139.7707),
            ],
            "restaurants": [
                ("Ichiran Ramen", "Famous tonkotsu ramen with individual booths", 35.6614, 139.7014),
                ("Genki Sushi", "Fun conveyor belt sushi experience", 35.6590, 139.7020),
                ("Afuri", "Yuzu shio ramen in a modern setting", 35.6498, 139.7104),
                ("Tsukiji Sushi Say", "Premium sushi near the outer market", 35.6653, 139.7701),
            ],
        },
    }

    default_data = {
        "lat": 48.8566, "lon": 2.3522,
        "attractions": [
            ("City Center Walking Tour", "Explore the historic heart of the city", None, None),
            ("National Museum", "Rich cultural heritage and historical artifacts", None, None),
            ("Local Market Visit", "Bustling market with local crafts and food", None, None),
            ("Scenic Viewpoint", "Panoramic views of the city and surroundings", None, None),
            ("Historic District", "Charming streets with traditional architecture", None, None),
            ("Cultural Performance", "Traditional music or dance show", None, None),
        ],
        "restaurants": [
            ("Local Bistro", "Traditional cuisine with a modern twist", None, None),
            ("Street Food Market", "Variety of local street food favorites", None, None),
            ("Rooftop Restaurant", "Dining with a view", None, None),
            ("Cafe Central", "Classic coffee house experience", None, None),
        ],
    }

    dest_key = destination.split(",")[0].strip().lower()
    info = dest_data.get(dest_key, default_data)

    cost_map = {"budget": ("$30", "$50-80", "$800"), "moderate": ("$60", "$100-150", "$1,500"), "luxury": ("$150", "$250-400", "$3,500")}
    costs = cost_map.get(budget_level, cost_map["moderate"])

    days = []
    themes = ["Arrival & Exploration", "Cultural Immersion", "Adventure & Discovery",
              "Local Life & Hidden Gems", "Markets & Cuisine", "Art & Architecture",
              "Nature & Relaxation", "History & Heritage", "Food & Nightlife",
              "Scenic Day Trip", "Shopping & Souvenirs", "Grand Finale",
              "Temples & Traditions", "Coastal Exploration"]

    for d in range(1, num_days + 1):
        theme = themes[(d - 1) % len(themes)]
        attr_start = ((d - 1) * 2) % len(info["attractions"])
        day_attractions = []
        for i in range(min(3, len(info["attractions"]))):
            idx = (attr_start + i) % len(info["attractions"])
            a = info["attractions"][idx]
            day_attractions.append({
                "time": f"{9 + i * 2}:00 AM" if i < 2 else f"{1 + i}:00 PM",
                "name": a[0],
                "description": a[1],
                "location": f"{destination} - {a[0]}",
                "estimated_cost": costs[0],
                "duration": "2 hours",
                "category": "sightseeing",
                "latitude": a[2],
                "longitude": a[3],
            })

        rest_idx = (d - 1) % len(info["restaurants"])
        rest2_idx = d % len(info["restaurants"])
        meals = [
            {
                "time": "12:30 PM",
                "name": info["restaurants"][rest_idx][0],
                "description": info["restaurants"][rest_idx][1],
                "location": f"{destination}",
                "estimated_cost": "$15-30",
                "duration": "1 hour",
                "category": "food",
                "latitude": info["restaurants"][rest_idx][2],
                "longitude": info["restaurants"][rest_idx][3],
            },
            {
                "time": "7:00 PM",
                "name": info["restaurants"][rest2_idx][0],
                "description": info["restaurants"][rest2_idx][1],
                "location": f"{destination}",
                "estimated_cost": "$20-50",
                "duration": "1.5 hours",
                "category": "food",
                "latitude": info["restaurants"][rest2_idx][2],
                "longitude": info["restaurants"][rest2_idx][3],
            },
        ]

        days.append({
            "day_number": d,
            "date": None,
            "theme": theme,
            "activities": day_attractions,
            "meals": meals,
            "daily_budget_estimate": costs[1],
            "tips": [
                f"Wear comfortable walking shoes for Day {d}",
                "Carry a refillable water bottle to stay hydrated",
            ],
        })

    return {
        "destination": destination,
        "trip_summary": (
            f"A {num_days}-day {travel_style} trip to {destination} on a {budget_level} budget. "
            f"This itinerary is designed for {num_travelers} traveler(s) "
            f"with interests in {', '.join(interests[:3]) if interests else 'general sightseeing'}."
        ),
        "num_days": num_days,
        "budget_level": budget_level,
        "total_estimated_cost": f"{costs[2]} per person",
        "days": days,
        "packing_tips": [
            "Comfortable walking shoes",
            "Universal power adapter",
            "Light rain jacket",
            "Reusable water bottle",
            "Sunscreen and sunglasses",
        ],
        "general_tips": [
            "Learn a few basic phrases in the local language",
            "Keep copies of important documents",
            "Notify your bank of travel plans",
            "Download offline maps before your trip",
            f"*This is a demo itinerary. Add an OpenAI API key for AI-generated personalized plans.*",
        ],
    }


def get_demo_rag_summary(query: str, results: list[dict]) -> str:
    context_snippets = []
    for r in results[:3]:
        source = r["source"].replace("_", " ").title()
        text_preview = r["text"][:200]
        context_snippets.append(f"From **{source}**: {text_preview}...")

    sources_text = "\n\n".join(context_snippets)

    return (
        f"Based on our travel guides, here's what I found about **\"{query}\"**:\n\n"
        f"{sources_text}\n\n"
        "For more details, see the full source documents below.\n\n"
        "*This is a demo summary assembled from search results. "
        "Add an OpenAI API key for AI-synthesized answers.*"
    )
