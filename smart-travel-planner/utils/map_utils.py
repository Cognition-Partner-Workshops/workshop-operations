"""Map utilities using Folium for interactive travel maps."""

from __future__ import annotations

from typing import Optional

import folium
from folium.plugins import MarkerCluster

DESTINATION_COORDS: dict[str, tuple[float, float]] = {
    "paris": (48.8566, 2.3522),
    "tokyo": (35.6762, 139.6503),
    "new york": (40.7128, -74.0060),
    "london": (51.5074, -0.1278),
    "rome": (41.9028, 12.4964),
    "bangkok": (13.7563, 100.5018),
    "sydney": (-33.8688, 151.2093),
    "dubai": (25.2048, 55.2708),
    "barcelona": (41.3874, 2.1686),
    "bali": (-8.3405, 115.0920),
    "istanbul": (41.0082, 28.9784),
    "amsterdam": (52.3676, 4.9041),
    "prague": (50.0755, 14.4378),
    "lisbon": (38.7223, -9.1393),
    "singapore": (1.3521, 103.8198),
    "cairo": (30.0444, 31.2357),
    "rio de janeiro": (-22.9068, -43.1729),
    "san francisco": (37.7749, -122.4194),
    "kyoto": (35.0116, 135.7681),
    "marrakech": (31.6295, -7.9811),
}


def get_destination_coords(
    destination: str,
) -> tuple[float, float]:
    """Get coordinates for a destination, falling back to a default."""
    city_key = destination.split(",")[0].strip().lower()
    return DESTINATION_COORDS.get(city_key, (48.8566, 2.3522))


def create_destination_map(
    destination: str,
    activities: Optional[list[dict]] = None,
    zoom_start: int = 13,
) -> folium.Map:
    """Create an interactive map for a destination with activity markers."""
    lat, lon = get_destination_coords(destination)

    m = folium.Map(
        location=[lat, lon],
        zoom_start=zoom_start,
        tiles="OpenStreetMap",
    )

    folium.Marker(
        location=[lat, lon],
        popup=f"<b>{destination}</b>",
        tooltip=destination,
        icon=folium.Icon(color="red", icon="star", prefix="fa"),
    ).add_to(m)

    if activities:
        marker_cluster = MarkerCluster().add_to(m)
        colors = [
            "blue", "green", "purple", "orange", "darkred",
            "cadetblue", "darkgreen", "darkpurple",
        ]

        for i, activity in enumerate(activities):
            act_lat = activity.get("latitude")
            act_lon = activity.get("longitude")
            if act_lat and act_lon:
                color = colors[i % len(colors)]
                icon_map = {
                    "sightseeing": "camera",
                    "food": "utensils",
                    "shopping": "shopping-bag",
                    "nature": "tree",
                    "culture": "landmark",
                    "entertainment": "music",
                    "transport": "car",
                }
                category = activity.get("category", "sightseeing")
                icon = icon_map.get(category, "map-marker-alt")

                popup_html = f"""
                <div style="min-width: 200px;">
                    <h4 style="margin: 0; color: #2c3e50;">{activity.get('name', '')}</h4>
                    <p style="margin: 5px 0; color: #666;">{activity.get('time', '')}</p>
                    <p style="margin: 5px 0;">{activity.get('description', '')}</p>
                    <p style="margin: 5px 0; color: #27ae60;">
                        <b>Cost:</b> {activity.get('estimated_cost', 'Free')}
                    </p>
                </div>
                """

                folium.Marker(
                    location=[act_lat, act_lon],
                    popup=folium.Popup(popup_html, max_width=300),
                    tooltip=activity.get("name", f"Activity {i + 1}"),
                    icon=folium.Icon(color=color, icon=icon, prefix="fa"),
                ).add_to(marker_cluster)

    return m


def create_multi_destination_map(
    destinations: list[str],
) -> folium.Map:
    """Create a map showing multiple destinations."""
    if not destinations:
        return folium.Map(location=[20, 0], zoom_start=2)

    coords = [get_destination_coords(d) for d in destinations]
    center_lat = sum(c[0] for c in coords) / len(coords)
    center_lon = sum(c[1] for c in coords) / len(coords)

    m = folium.Map(location=[center_lat, center_lon], zoom_start=3)

    for dest, (lat, lon) in zip(destinations, coords):
        folium.Marker(
            location=[lat, lon],
            popup=f"<b>{dest}</b>",
            tooltip=dest,
            icon=folium.Icon(color="red", icon="plane", prefix="fa"),
        ).add_to(m)

    if len(coords) > 1:
        folium.PolyLine(
            locations=coords,
            weight=2,
            color="blue",
            opacity=0.6,
            dash_array="5",
        ).add_to(m)

    return m
