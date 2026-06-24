"""Page 3: Itinerary Generator - Generate structured day-by-day travel itineraries."""

import json
import sys
from datetime import date, timedelta
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.models import BudgetLevel, Itinerary, TravelStyle
from utils.openai_client import chat_completion, get_openai_client
from utils.pdf_export import generate_itinerary_pdf

st.set_page_config(page_title="Itinerary Generator", page_icon="📋", layout="wide")

st.title("📋 AI Itinerary Generator")
st.markdown(
    "Generate a detailed day-by-day travel itinerary tailored to your preferences, "
    "budget, and travel style. Export as a polished PDF."
)

ITINERARY_PROMPT = """Generate a detailed {num_days}-day travel itinerary for {destination}.

Travel Style: {travel_style}
Budget Level: {budget_level}
Number of Travelers: {num_travelers}
{interests_text}
{dates_text}

Return a valid JSON object with this exact structure (no markdown, no code fences):
{{
    "destination": "{destination}",
    "trip_summary": "A 2-3 sentence overview of the trip",
    "num_days": {num_days},
    "budget_level": "{budget_level}",
    "total_estimated_cost": "$X,XXX per person",
    "days": [
        {{
            "day_number": 1,
            "date": "date or null",
            "theme": "Theme for the day",
            "activities": [
                {{
                    "time": "09:00 AM",
                    "name": "Activity Name",
                    "description": "Brief description of the activity",
                    "location": "Specific location or address",
                    "estimated_cost": "$XX or Free",
                    "duration": "2 hours",
                    "category": "sightseeing",
                    "latitude": 48.8584,
                    "longitude": 2.2945
                }}
            ],
            "meals": [
                {{
                    "time": "12:30 PM",
                    "name": "Restaurant Name",
                    "description": "Type of cuisine and what to try",
                    "location": "Address",
                    "estimated_cost": "$XX",
                    "duration": "1 hour",
                    "category": "food",
                    "latitude": null,
                    "longitude": null
                }}
            ],
            "daily_budget_estimate": "$XXX",
            "tips": ["Tip 1 for this day", "Tip 2"]
        }}
    ],
    "packing_tips": ["Item 1", "Item 2"],
    "general_tips": ["Tip 1", "Tip 2"]
}}

Include 3-5 activities and 2-3 meals per day. Provide real coordinates for activities where possible.
Ensure activities flow logically by location to minimize travel time.
Adjust recommendations based on the budget level and travel style."""


def _check_api_key() -> bool:
    client = get_openai_client()
    if client is None:
        st.warning(
            "Please enter your OpenAI API key in the sidebar on the Home page to generate itineraries."
        )
        return False
    return True


with st.sidebar:
    st.subheader("Trip Configuration")

    destination = st.text_input(
        "Destination",
        placeholder="e.g., Paris, France",
        help="Enter a city, region, or country",
    )

    num_days = st.slider("Number of Days", min_value=1, max_value=14, value=3)

    budget_level = st.selectbox(
        "Budget Level",
        options=[b.value for b in BudgetLevel],
        index=1,
        format_func=lambda x: x.title(),
    )

    travel_style = st.selectbox(
        "Travel Style",
        options=[s.value for s in TravelStyle],
        index=1,
        format_func=lambda x: x.title(),
    )

    num_travelers = st.number_input(
        "Number of Travelers", min_value=1, max_value=20, value=2
    )

    interests = st.multiselect(
        "Specific Interests",
        options=[
            "History", "Art", "Food & Wine", "Nature", "Adventure Sports",
            "Photography", "Shopping", "Nightlife", "Architecture",
            "Local Culture", "Music", "Wellness & Spa",
        ],
        default=["Food & Wine", "Local Culture"],
    )

    use_dates = st.checkbox("Set specific dates")
    start_date = None
    if use_dates:
        start_date = st.date_input("Start Date", value=date.today() + timedelta(days=30))

    generate_btn = st.button(
        "Generate Itinerary", type="primary", use_container_width=True
    )

if generate_btn:
    if not destination:
        st.error("Please enter a destination.")
        st.stop()

    if not _check_api_key():
        st.stop()

    interests_text = f"Special Interests: {', '.join(interests)}" if interests else ""
    if start_date:
        end_date = start_date + timedelta(days=num_days - 1)
        dates_text = f"Travel Dates: {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}"
    else:
        dates_text = ""

    prompt = ITINERARY_PROMPT.format(
        destination=destination,
        num_days=num_days,
        budget_level=budget_level,
        travel_style=travel_style,
        num_travelers=num_travelers,
        interests_text=interests_text,
        dates_text=dates_text,
    )

    with st.spinner(f"Generating your {num_days}-day {destination} itinerary..."):
        response = chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert travel planner. Generate detailed, practical itineraries. Return ONLY valid JSON, no markdown fences.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        if response is None:
            st.error("Failed to generate itinerary. Please check your API key.")
            st.stop()

        raw_content = response.choices[0].message.content
        try:
            itinerary_data = json.loads(raw_content)
            itinerary = Itinerary(**itinerary_data)
            st.session_state["current_itinerary"] = itinerary
        except (json.JSONDecodeError, Exception) as e:
            st.error(f"Error parsing itinerary: {e}")
            st.code(raw_content)
            st.stop()

if "current_itinerary" in st.session_state:
    itinerary = st.session_state["current_itinerary"]

    st.header(f"📍 {itinerary.destination}")
    st.markdown(f"*{itinerary.trip_summary}*")

    col1, col2, col3 = st.columns(3)
    col1.metric("Duration", f"{itinerary.num_days} Days")
    col2.metric("Budget Level", itinerary.budget_level.title())
    col3.metric("Est. Total Cost", itinerary.total_estimated_cost or "See details")

    st.divider()

    for day in itinerary.days:
        day_title = f"Day {day.day_number}: {day.theme}"
        if day.date:
            day_title += f" ({day.date})"

        with st.expander(day_title, expanded=(day.day_number <= 2)):
            if day.daily_budget_estimate:
                st.caption(f"Daily budget estimate: {day.daily_budget_estimate}")

            if day.activities:
                st.subheader("Activities")
                for activity in day.activities:
                    acol1, acol2 = st.columns([3, 1])
                    with acol1:
                        st.markdown(f"**{activity.time}** - {activity.name}")
                        st.markdown(activity.description)
                        st.caption(
                            f"📍 {activity.location} | ⏱️ {activity.duration} | 💰 {activity.estimated_cost}"
                        )
                    with acol2:
                        st.markdown(f"*{activity.category.title()}*")

            if day.meals:
                st.subheader("Meals")
                for meal in day.meals:
                    st.markdown(f"**{meal.time}** - {meal.name}")
                    st.markdown(meal.description)
                    st.caption(f"📍 {meal.location} | 💰 {meal.estimated_cost}")

            if day.tips:
                st.subheader("Tips")
                for tip in day.tips:
                    st.markdown(f"- {tip}")

    if itinerary.packing_tips or itinerary.general_tips:
        st.divider()
        tcol1, tcol2 = st.columns(2)

        if itinerary.packing_tips:
            with tcol1:
                st.subheader("🎒 Packing Tips")
                for tip in itinerary.packing_tips:
                    st.markdown(f"- {tip}")

        if itinerary.general_tips:
            with tcol2:
                st.subheader("💡 General Tips")
                for tip in itinerary.general_tips:
                    st.markdown(f"- {tip}")

    st.divider()
    st.subheader("Export Itinerary")

    try:
        pdf_bytes = generate_itinerary_pdf(itinerary)
        st.download_button(
            label="Download PDF Itinerary",
            data=pdf_bytes,
            file_name=f"{itinerary.destination.replace(' ', '_').replace(',', '')}_itinerary.pdf",
            mime="application/pdf",
            use_container_width=True,
            type="primary",
        )
    except Exception as e:
        st.error(f"Error generating PDF: {e}")

    itinerary_json = itinerary.model_dump_json(indent=2)
    st.download_button(
        label="Download JSON Data",
        data=itinerary_json,
        file_name=f"{itinerary.destination.replace(' ', '_').replace(',', '')}_itinerary.json",
        mime="application/json",
        use_container_width=True,
    )

else:
    st.info(
        "Configure your trip details in the sidebar and click 'Generate Itinerary' "
        "to create a personalized day-by-day travel plan."
    )

    st.markdown(
        """
        ### Features
        - **Personalized plans** based on your travel style and interests
        - **Detailed daily schedules** with activities, meals, and timing
        - **Budget estimates** for each day and the entire trip
        - **Location coordinates** for interactive map viewing
        - **Practical tips** for packing and local customs
        - **PDF export** for offline access
        """
    )
