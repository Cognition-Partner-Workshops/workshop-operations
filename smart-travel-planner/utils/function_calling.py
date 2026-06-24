"""Function calling definitions for weather and pricing data."""

from __future__ import annotations

import json
import random
from typing import Any

from utils.models import PricingData, WeatherData

WEATHER_TOOL = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather and forecast for a travel destination",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name, e.g. 'Paris, France'",
                },
                "date": {
                    "type": "string",
                    "description": "Date for forecast in YYYY-MM-DD format",
                },
            },
            "required": ["location"],
        },
    },
}

PRICING_TOOL = {
    "type": "function",
    "function": {
        "name": "get_pricing",
        "description": "Get estimated travel costs for a destination including flights, hotels, and daily expenses",
        "parameters": {
            "type": "object",
            "properties": {
                "destination": {
                    "type": "string",
                    "description": "Destination city, e.g. 'Tokyo, Japan'",
                },
                "num_days": {
                    "type": "integer",
                    "description": "Number of days for the trip",
                },
                "budget_level": {
                    "type": "string",
                    "enum": ["budget", "moderate", "luxury"],
                    "description": "Budget level for the trip",
                },
            },
            "required": ["destination"],
        },
    },
}

FUNCTION_TOOLS = [WEATHER_TOOL, PRICING_TOOL]

DESTINATION_WEATHER: dict[str, dict[str, Any]] = {
    "paris": {
        "temp_range": (8, 25),
        "conditions": ["Partly Cloudy", "Sunny", "Light Rain", "Overcast"],
        "humidity_range": (55, 80),
        "wind_range": (8, 20),
    },
    "tokyo": {
        "temp_range": (5, 32),
        "conditions": ["Sunny", "Humid", "Rainy", "Clear"],
        "humidity_range": (50, 85),
        "wind_range": (5, 15),
    },
    "new york": {
        "temp_range": (-2, 33),
        "conditions": ["Clear", "Partly Cloudy", "Sunny", "Snow Flurries", "Rain"],
        "humidity_range": (40, 75),
        "wind_range": (10, 30),
    },
    "london": {
        "temp_range": (4, 23),
        "conditions": ["Overcast", "Light Rain", "Drizzle", "Partly Cloudy", "Foggy"],
        "humidity_range": (65, 90),
        "wind_range": (10, 25),
    },
    "rome": {
        "temp_range": (6, 33),
        "conditions": ["Sunny", "Clear", "Partly Cloudy", "Warm"],
        "humidity_range": (45, 70),
        "wind_range": (5, 18),
    },
    "bangkok": {
        "temp_range": (25, 36),
        "conditions": ["Hot and Humid", "Tropical Rain", "Sunny", "Thunderstorms"],
        "humidity_range": (70, 95),
        "wind_range": (5, 12),
    },
    "sydney": {
        "temp_range": (12, 28),
        "conditions": ["Sunny", "Clear", "Partly Cloudy", "Warm Breeze"],
        "humidity_range": (45, 70),
        "wind_range": (10, 25),
    },
    "dubai": {
        "temp_range": (18, 45),
        "conditions": ["Sunny", "Hot", "Clear", "Hazy"],
        "humidity_range": (30, 65),
        "wind_range": (8, 20),
    },
    "barcelona": {
        "temp_range": (8, 30),
        "conditions": ["Sunny", "Mediterranean Breeze", "Clear", "Warm"],
        "humidity_range": (50, 75),
        "wind_range": (8, 20),
    },
    "bali": {
        "temp_range": (24, 33),
        "conditions": ["Tropical", "Sunny", "Afternoon Showers", "Humid"],
        "humidity_range": (70, 90),
        "wind_range": (5, 15),
    },
}

DESTINATION_PRICING: dict[str, dict[str, Any]] = {
    "paris": {
        "flight": (400, 800, 2000),
        "hotel": (80, 180, 500),
        "meal": (15, 40, 120),
        "transport": (10, 20, 60),
        "currency": "EUR",
    },
    "tokyo": {
        "flight": (500, 900, 2500),
        "hotel": (60, 150, 450),
        "meal": (10, 35, 100),
        "transport": (12, 25, 50),
        "currency": "JPY",
    },
    "new york": {
        "flight": (200, 500, 1500),
        "hotel": (100, 250, 700),
        "meal": (15, 45, 150),
        "transport": (10, 25, 80),
        "currency": "USD",
    },
    "london": {
        "flight": (350, 700, 2000),
        "hotel": (90, 200, 600),
        "meal": (12, 35, 100),
        "transport": (15, 25, 50),
        "currency": "GBP",
    },
    "rome": {
        "flight": (350, 650, 1800),
        "hotel": (60, 150, 400),
        "meal": (12, 30, 90),
        "transport": (8, 15, 40),
        "currency": "EUR",
    },
    "bangkok": {
        "flight": (400, 750, 2000),
        "hotel": (25, 80, 300),
        "meal": (5, 15, 60),
        "transport": (3, 10, 30),
        "currency": "THB",
    },
    "sydney": {
        "flight": (600, 1100, 3000),
        "hotel": (80, 200, 550),
        "meal": (15, 40, 120),
        "transport": (10, 20, 50),
        "currency": "AUD",
    },
    "dubai": {
        "flight": (450, 850, 2500),
        "hotel": (70, 200, 800),
        "meal": (10, 35, 150),
        "transport": (8, 20, 60),
        "currency": "AED",
    },
    "barcelona": {
        "flight": (300, 600, 1700),
        "hotel": (60, 140, 400),
        "meal": (10, 30, 90),
        "transport": (8, 15, 40),
        "currency": "EUR",
    },
    "bali": {
        "flight": (500, 900, 2200),
        "hotel": (20, 80, 350),
        "meal": (4, 15, 60),
        "transport": (5, 12, 35),
        "currency": "IDR",
    },
}

DEFAULT_WEATHER = {
    "temp_range": (10, 28),
    "conditions": ["Partly Cloudy", "Sunny", "Clear"],
    "humidity_range": (50, 75),
    "wind_range": (8, 20),
}

DEFAULT_PRICING = {
    "flight": (400, 800, 2000),
    "hotel": (60, 160, 450),
    "meal": (12, 35, 100),
    "transport": (8, 20, 50),
    "currency": "USD",
}


def get_weather(location: str, forecast_date: str = "today") -> dict:
    city_key = location.split(",")[0].strip().lower()
    weather_info = DESTINATION_WEATHER.get(city_key, DEFAULT_WEATHER)

    temp_c = round(
        random.uniform(weather_info["temp_range"][0], weather_info["temp_range"][1]), 1
    )
    temp_f = round(temp_c * 9 / 5 + 32, 1)
    condition = random.choice(weather_info["conditions"])
    humidity = random.randint(
        weather_info["humidity_range"][0], weather_info["humidity_range"][1]
    )
    wind = round(
        random.uniform(weather_info["wind_range"][0], weather_info["wind_range"][1]), 1
    )

    weather = WeatherData(
        location=location,
        temperature_celsius=temp_c,
        temperature_fahrenheit=temp_f,
        condition=condition,
        humidity=humidity,
        wind_speed_kmh=wind,
        forecast_date=forecast_date,
    )
    return weather.model_dump()


def get_pricing(
    destination: str,
    num_days: int = 3,
    budget_level: str = "moderate",
) -> dict:
    city_key = destination.split(",")[0].strip().lower()
    pricing_info = DESTINATION_PRICING.get(city_key, DEFAULT_PRICING)
    currency = pricing_info["currency"]

    level_idx = {"budget": 0, "moderate": 1, "luxury": 2}.get(budget_level, 1)

    flight = pricing_info["flight"][level_idx]
    hotel = pricing_info["hotel"][level_idx]
    meal = pricing_info["meal"][level_idx]
    transport = pricing_info["transport"][level_idx]

    variation = random.uniform(0.9, 1.1)
    flight = round(flight * variation)
    hotel = round(hotel * variation)

    budget_total = round(
        pricing_info["flight"][0]
        + pricing_info["hotel"][0] * num_days
        + pricing_info["meal"][0] * 3 * num_days
        + pricing_info["transport"][0] * num_days
    )
    moderate_total = round(
        pricing_info["flight"][1]
        + pricing_info["hotel"][1] * num_days
        + pricing_info["meal"][1] * 3 * num_days
        + pricing_info["transport"][1] * num_days
    )
    luxury_total = round(
        pricing_info["flight"][2]
        + pricing_info["hotel"][2] * num_days
        + pricing_info["meal"][2] * 3 * num_days
        + pricing_info["transport"][2] * num_days
    )

    pricing = PricingData(
        destination=destination,
        flight_estimate=f"${flight}",
        hotel_per_night=f"${hotel}",
        meal_average=f"${meal}",
        local_transport_daily=f"${transport}",
        currency=currency,
        budget_total=f"${budget_total}",
        moderate_total=f"${moderate_total}",
        luxury_total=f"${luxury_total}",
    )
    return pricing.model_dump()


FUNCTION_DISPATCH: dict[str, Any] = {
    "get_weather": get_weather,
    "get_pricing": get_pricing,
}


def process_tool_calls(response) -> list[dict]:
    """Process tool calls from an OpenAI response and return results."""
    results = []
    message = response.choices[0].message

    if not message.tool_calls:
        return results

    for tool_call in message.tool_calls:
        fn_name = tool_call.function.name
        fn_args = json.loads(tool_call.function.arguments)

        if fn_name == "get_weather":
            result = get_weather(
                location=fn_args["location"],
                forecast_date=fn_args.get("date", "today"),
            )
        elif fn_name == "get_pricing":
            result = get_pricing(
                destination=fn_args["destination"],
                num_days=fn_args.get("num_days", 3),
                budget_level=fn_args.get("budget_level", "moderate"),
            )
        else:
            result = {"error": f"Unknown function: {fn_name}"}

        results.append(
            {
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": fn_name,
                "content": json.dumps(result),
            }
        )

    return results
