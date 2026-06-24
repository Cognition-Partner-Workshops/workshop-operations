"""Page 5: Interactive Map & Weather Dashboard."""

import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from streamlit_folium import st_folium

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.function_calling import get_pricing, get_weather
from utils.map_utils import (
    DESTINATION_COORDS,
    create_destination_map,
    create_multi_destination_map,
)
from utils.models import Itinerary

st.set_page_config(page_title="Map & Weather", page_icon="🗺️", layout="wide")

st.title("🗺️ Interactive Map & Weather Dashboard")
st.markdown(
    "Explore destinations on an interactive map, check weather conditions, "
    "and compare travel costs across popular destinations."
)

tab1, tab2, tab3 = st.tabs(
    ["🗺️ Destination Map", "🌤️ Weather Dashboard", "💰 Cost Comparison"]
)

with tab1:
    st.subheader("Explore Destinations")

    map_mode = st.radio(
        "Map Mode",
        ["Single Destination", "Multi-Destination", "Itinerary View"],
        horizontal=True,
    )

    if map_mode == "Single Destination":
        available_destinations = sorted(
            [d.title() for d in DESTINATION_COORDS.keys()]
        )
        selected_dest = st.selectbox(
            "Select a destination",
            available_destinations,
            index=0,
        )

        activities = None
        if "current_itinerary" in st.session_state:
            itin = st.session_state["current_itinerary"]
            if itin.destination.lower().startswith(selected_dest.lower()):
                all_activities = []
                for day in itin.days:
                    for act in day.activities:
                        all_activities.append(act.model_dump())
                if all_activities:
                    activities = all_activities
                    st.info(
                        f"Showing {len(activities)} activities from your {itin.destination} itinerary"
                    )

        m = create_destination_map(selected_dest, activities=activities)
        st_folium(m, width=None, height=500, returned_objects=[])

    elif map_mode == "Multi-Destination":
        available_destinations = sorted(
            [d.title() for d in DESTINATION_COORDS.keys()]
        )
        selected_dests = st.multiselect(
            "Select destinations to compare",
            available_destinations,
            default=["Paris", "Tokyo", "New York"],
        )

        if selected_dests:
            m = create_multi_destination_map(selected_dests)
            st_folium(m, width=None, height=500, returned_objects=[])
        else:
            st.info("Select at least one destination to display on the map.")

    else:
        if "current_itinerary" in st.session_state:
            itin = st.session_state["current_itinerary"]
            st.markdown(f"**Showing itinerary for:** {itin.destination}")

            all_activities = []
            for day in itin.days:
                for act in day.activities:
                    act_dict = act.model_dump()
                    act_dict["day"] = day.day_number
                    all_activities.append(act_dict)

            if all_activities:
                m = create_destination_map(
                    itin.destination, activities=all_activities
                )
                st_folium(m, width=None, height=500, returned_objects=[])

                st.subheader("Activity Details")
                df = pd.DataFrame(all_activities)
                display_cols = ["day", "time", "name", "location", "estimated_cost", "category"]
                available_cols = [c for c in display_cols if c in df.columns]
                st.dataframe(df[available_cols], use_container_width=True, hide_index=True)
            else:
                st.info("No activities with coordinates found in the current itinerary.")
        else:
            st.info(
                "Generate an itinerary first on the Itinerary Generator page "
                "to see it on the map."
            )

with tab2:
    st.subheader("Weather Dashboard")

    wcol1, wcol2 = st.columns([1, 2])

    with wcol1:
        weather_destinations = st.multiselect(
            "Select destinations for weather",
            sorted([d.title() for d in DESTINATION_COORDS.keys()]),
            default=["Paris", "Tokyo", "London", "Bangkok"],
            key="weather_dests",
        )

        if st.button("Fetch Weather Data", type="primary", use_container_width=True):
            weather_data = []
            for dest in weather_destinations:
                data = get_weather(dest)
                weather_data.append(data)
            st.session_state["weather_data"] = weather_data

    with wcol2:
        if "weather_data" in st.session_state:
            weather_data = st.session_state["weather_data"]

            cols = st.columns(min(len(weather_data), 4))
            for i, data in enumerate(weather_data):
                col_idx = i % len(cols)
                with cols[col_idx]:
                    st.metric(
                        label=data["location"],
                        value=f"{data['temperature_celsius']}°C",
                        delta=data["condition"],
                    )
                    st.caption(
                        f"💧 {data['humidity']}% | 💨 {data['wind_speed_kmh']} km/h"
                    )

            st.divider()

            df_weather = pd.DataFrame(weather_data)

            fig_temp = px.bar(
                df_weather,
                x="location",
                y="temperature_celsius",
                color="condition",
                title="Temperature Comparison",
                labels={
                    "temperature_celsius": "Temperature (°C)",
                    "location": "Destination",
                },
                color_discrete_sequence=px.colors.qualitative.Set2,
            )
            fig_temp.update_layout(showlegend=True, height=400)
            st.plotly_chart(fig_temp, use_container_width=True)

            fig_humidity = go.Figure()
            fig_humidity.add_trace(
                go.Scatterpolar(
                    r=df_weather["humidity"].tolist(),
                    theta=df_weather["location"].tolist(),
                    fill="toself",
                    name="Humidity %",
                    line=dict(color="#3498db"),
                )
            )
            fig_humidity.add_trace(
                go.Scatterpolar(
                    r=df_weather["wind_speed_kmh"].tolist(),
                    theta=df_weather["location"].tolist(),
                    fill="toself",
                    name="Wind Speed (km/h)",
                    line=dict(color="#e74c3c"),
                )
            )
            fig_humidity.update_layout(
                polar=dict(radialaxis=dict(visible=True)),
                title="Humidity & Wind Comparison",
                height=400,
            )
            st.plotly_chart(fig_humidity, use_container_width=True)
        else:
            st.info("Click 'Fetch Weather Data' to see weather comparisons.")

with tab3:
    st.subheader("Travel Cost Comparison")

    pcol1, pcol2 = st.columns([1, 2])

    with pcol1:
        price_destinations = st.multiselect(
            "Select destinations to compare costs",
            sorted([d.title() for d in DESTINATION_COORDS.keys()]),
            default=["Paris", "Tokyo", "Bangkok", "New York"],
            key="price_dests",
        )

        price_days = st.slider(
            "Trip duration (days)", min_value=1, max_value=14, value=5, key="price_days"
        )

        if st.button("Compare Costs", type="primary", use_container_width=True):
            pricing_data = []
            for dest in price_destinations:
                for level in ["budget", "moderate", "luxury"]:
                    data = get_pricing(dest, num_days=price_days, budget_level=level)
                    data["budget_level_label"] = level.title()
                    pricing_data.append(data)
            st.session_state["pricing_data"] = pricing_data

    with pcol2:
        if "pricing_data" in st.session_state:
            pricing_data = st.session_state["pricing_data"]
            df_pricing = pd.DataFrame(pricing_data)

            df_moderate = df_pricing[df_pricing["budget_level_label"] == "Moderate"]
            if not df_moderate.empty:
                cols = st.columns(min(len(df_moderate), 4))
                for i, (_, row) in enumerate(df_moderate.iterrows()):
                    col_idx = i % len(cols)
                    with cols[col_idx]:
                        st.metric(
                            label=row["destination"],
                            value=row["moderate_total"],
                            delta=f"Flight: {row['flight_estimate']}",
                        )
                        st.caption(
                            f"Hotel: {row['hotel_per_night']}/night | "
                            f"Meals: {row['meal_average']}/meal"
                        )

            st.divider()

            totals_data = []
            for dest in price_destinations:
                dest_data = df_pricing[df_pricing["destination"] == dest]
                for _, row in dest_data.iterrows():
                    level = row["budget_level_label"]
                    total_key = f"{level.lower()}_total"
                    total_val = row.get(total_key, "$0")
                    total_num = float(total_val.replace("$", "").replace(",", ""))
                    totals_data.append(
                        {
                            "Destination": dest,
                            "Budget Level": level,
                            "Total Cost ($)": total_num,
                        }
                    )

            df_totals = pd.DataFrame(totals_data)

            fig_costs = px.bar(
                df_totals,
                x="Destination",
                y="Total Cost ($)",
                color="Budget Level",
                barmode="group",
                title=f"Total Trip Cost Comparison ({price_days} days)",
                color_discrete_map={
                    "Budget": "#27ae60",
                    "Moderate": "#f39c12",
                    "Luxury": "#e74c3c",
                },
            )
            fig_costs.update_layout(height=450)
            st.plotly_chart(fig_costs, use_container_width=True)

            breakdown_data = []
            for _, row in df_moderate.iterrows():
                dest = row["destination"]
                for category, value_key in [
                    ("Flight", "flight_estimate"),
                    ("Hotel/Night", "hotel_per_night"),
                    ("Meals", "meal_average"),
                    ("Transport/Day", "local_transport_daily"),
                ]:
                    val = float(
                        row[value_key].replace("$", "").replace(",", "")
                    )
                    breakdown_data.append(
                        {
                            "Destination": dest,
                            "Category": category,
                            "Cost ($)": val,
                        }
                    )

            df_breakdown = pd.DataFrame(breakdown_data)
            fig_breakdown = px.bar(
                df_breakdown,
                x="Destination",
                y="Cost ($)",
                color="Category",
                title="Cost Breakdown (Moderate Budget)",
                color_discrete_sequence=px.colors.qualitative.Pastel,
            )
            fig_breakdown.update_layout(height=400)
            st.plotly_chart(fig_breakdown, use_container_width=True)
        else:
            st.info("Click 'Compare Costs' to see price comparisons across destinations.")
