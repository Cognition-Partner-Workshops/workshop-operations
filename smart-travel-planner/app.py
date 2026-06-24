"""Smart Travel Planner - Main entry point and home page."""

import sys
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent))

st.set_page_config(
    page_title="Smart Travel Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1a73e8;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 0.5rem 0;
        border: 1px solid #e0e0e0;
    }
    .feature-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    .stMetric {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 10px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("Settings")

    api_key = st.text_input(
        "OpenAI API Key",
        type="password",
        placeholder="sk-...",
        help="Enter your OpenAI API key to enable AI features",
        value=st.session_state.get("openai_api_key", ""),
    )
    if api_key:
        st.session_state["openai_api_key"] = api_key
        st.success("API key set!")

    st.divider()
    st.markdown(
        """
        ### Navigation
        Use the sidebar pages to access:
        - **Chat Trip Planner** - Plan via conversation
        - **Photo Analyzer** - Analyze destination photos
        - **Itinerary Generator** - Day-by-day plans
        - **Travel Guide Search** - RAG-powered search
        - **Map & Weather** - Interactive maps & data
        """
    )

st.markdown('<div class="main-header">✈️ Smart Travel Planner</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-header">AI-Powered Itinerary Generator & Travel Assistant</div>',
    unsafe_allow_html=True,
)

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">💬</div>
        <h3>Chat Trip Planner</h3>
        <p>Plan your perfect trip through natural conversation. Get personalized 
        recommendations, weather forecasts, and price comparisons powered by 
        AI function calling.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col2:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">📸</div>
        <h3>Photo Analyzer</h3>
        <p>Upload a photo of any destination and get AI-powered analysis including 
        location identification, nearby attractions, travel tips, and best visiting times.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col3:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">📋</div>
        <h3>Itinerary Generator</h3>
        <p>Generate structured day-by-day itineraries with activities, meals, 
        budget estimates, and coordinates. Export as a polished PDF document.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

col4, col5, col6 = st.columns(3)

with col4:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">📚</div>
        <h3>Travel Guide Search</h3>
        <p>Search curated travel guides using RAG (Retrieval-Augmented Generation) 
        with ChromaDB. Get AI-enhanced answers from indexed destination guides.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col5:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">🗺️</div>
        <h3>Map & Weather</h3>
        <p>Explore destinations on interactive Folium maps, compare weather across 
        cities with Plotly charts, and analyze travel costs side by side.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col6:
    st.markdown(
        """
        <div class="feature-card">
        <div class="feature-icon">📄</div>
        <h3>PDF Export</h3>
        <p>Export your generated itineraries as polished PDF documents with 
        day-by-day schedules, budget breakdowns, and practical travel tips.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.divider()

st.subheader("Quick Start")

st.markdown(
    """
    1. **Navigate to any page** using the sidebar menu - all features work in demo mode!
    2. *(Optional)* Enter your OpenAI API key in the sidebar for AI-powered responses
    3. **Start planning** your dream trip!
    
    ### Key Technologies
    
    | Feature | Technology |
    |---|---|
    | Conversational AI | OpenAI GPT-4o-mini with function calling |
    | Photo Analysis | GPT-4 Vision API |
    | Travel Guide Search | ChromaDB vector store + RAG pipeline |
    | Interactive Maps | Folium + streamlit-folium |
    | Data Visualization | Plotly Express |
    | PDF Export | FPDF2 with custom styling |
    | Data Models | Pydantic v2 |
    | Configuration | python-dotenv |
    """
)

st.divider()

st.subheader("Covered Destinations")

destinations = [
    ("Paris", "France", "City of Light"),
    ("Tokyo", "Japan", "Where Tradition Meets Innovation"),
    ("New York", "USA", "The City That Never Sleeps"),
    ("London", "UK", "A Royal Experience"),
    ("Rome", "Italy", "The Eternal City"),
    ("Bangkok", "Thailand", "City of Angels"),
    ("Barcelona", "Spain", "Gaudi's Masterpiece City"),
    ("Sydney", "Australia", "Harbor City"),
    ("Dubai", "UAE", "City of Superlatives"),
    ("Bali", "Indonesia", "Island of the Gods"),
]

dcols = st.columns(5)
for i, (city, country, tagline) in enumerate(destinations):
    with dcols[i % 5]:
        st.metric(label=f"{city}, {country}", value=tagline)

st.divider()
st.markdown(
    """
    <div style="text-align: center; color: #999; font-size: 0.85em; padding: 1rem;">
        Built with Streamlit, OpenAI, ChromaDB, Folium, Plotly, and FPDF2<br>
        AI-generated content should be verified before making travel plans
    </div>
    """,
    unsafe_allow_html=True,
)
