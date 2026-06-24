"""Pydantic models for the Smart Travel Planner."""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class BudgetLevel(str, Enum):
    BUDGET = "budget"
    MODERATE = "moderate"
    LUXURY = "luxury"


class TravelStyle(str, Enum):
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    RELAXATION = "relaxation"
    FOODIE = "foodie"
    FAMILY = "family"
    ROMANTIC = "romantic"
    SOLO = "solo"


class TripPreferences(BaseModel):
    destination: str = Field(..., description="Travel destination city or region")
    start_date: Optional[date] = Field(None, description="Trip start date")
    end_date: Optional[date] = Field(None, description="Trip end date")
    num_days: int = Field(3, ge=1, le=30, description="Number of days for the trip")
    budget_level: BudgetLevel = Field(BudgetLevel.MODERATE, description="Budget level")
    travel_style: TravelStyle = Field(
        TravelStyle.CULTURAL, description="Preferred travel style"
    )
    interests: list[str] = Field(
        default_factory=list, description="Specific interests or activities"
    )
    num_travelers: int = Field(1, ge=1, description="Number of travelers")


class Activity(BaseModel):
    time: str = Field(..., description="Time of day (e.g., '09:00 AM')")
    name: str = Field(..., description="Activity name")
    description: str = Field(..., description="Brief description")
    location: str = Field(..., description="Location or address")
    estimated_cost: str = Field("Free", description="Estimated cost")
    duration: str = Field("1 hour", description="Estimated duration")
    category: str = Field("sightseeing", description="Activity category")
    latitude: Optional[float] = Field(None, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, description="Longitude coordinate")


class DayPlan(BaseModel):
    day_number: int = Field(..., description="Day number in the itinerary")
    date: Optional[str] = Field(None, description="Date for this day")
    theme: str = Field(..., description="Theme or focus for the day")
    activities: list[Activity] = Field(
        default_factory=list, description="List of activities"
    )
    meals: list[Activity] = Field(
        default_factory=list, description="Meal recommendations"
    )
    daily_budget_estimate: str = Field("", description="Estimated daily spend")
    tips: list[str] = Field(
        default_factory=list, description="Tips for the day"
    )


class Itinerary(BaseModel):
    destination: str = Field(..., description="Destination name")
    trip_summary: str = Field("", description="Brief trip overview")
    num_days: int = Field(..., description="Total number of days")
    budget_level: str = Field("moderate", description="Budget level")
    total_estimated_cost: str = Field("", description="Total estimated trip cost")
    days: list[DayPlan] = Field(default_factory=list, description="Day-by-day plans")
    packing_tips: list[str] = Field(
        default_factory=list, description="Packing suggestions"
    )
    general_tips: list[str] = Field(
        default_factory=list, description="General travel tips"
    )


class WeatherData(BaseModel):
    location: str = Field(..., description="Location name")
    temperature_celsius: float = Field(..., description="Temperature in Celsius")
    temperature_fahrenheit: float = Field(
        ..., description="Temperature in Fahrenheit"
    )
    condition: str = Field(..., description="Weather condition")
    humidity: int = Field(..., description="Humidity percentage")
    wind_speed_kmh: float = Field(..., description="Wind speed in km/h")
    forecast_date: str = Field(..., description="Forecast date")
    icon: str = Field("", description="Weather icon identifier")


class PricingData(BaseModel):
    destination: str = Field(..., description="Destination")
    flight_estimate: str = Field(..., description="Round-trip flight estimate")
    hotel_per_night: str = Field(..., description="Hotel cost per night")
    meal_average: str = Field(..., description="Average meal cost")
    local_transport_daily: str = Field(
        ..., description="Daily local transport cost"
    )
    currency: str = Field("USD", description="Currency code")
    budget_total: str = Field("", description="Budget trip total")
    moderate_total: str = Field("", description="Moderate trip total")
    luxury_total: str = Field("", description="Luxury trip total")


class PhotoAnalysis(BaseModel):
    location_identified: str = Field(
        "", description="Identified location from the photo"
    )
    landmarks: list[str] = Field(
        default_factory=list, description="Identified landmarks"
    )
    description: str = Field("", description="Scene description")
    travel_tips: list[str] = Field(
        default_factory=list, description="Travel tips based on the photo"
    )
    best_time_to_visit: str = Field(
        "", description="Recommended time to visit"
    )
    nearby_attractions: list[str] = Field(
        default_factory=list, description="Nearby attractions to explore"
    )
