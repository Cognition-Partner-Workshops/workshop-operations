# AI-Powered Smart Travel Planner & Itinerary Generator

A multi-page Streamlit app that helps users plan trips through conversation, analyzes destination photos, generates structured day-by-day itineraries, fetches live weather and pricing data via function calling, searches travel guides using RAG, and exports polished PDF itineraries.

## Features

| Page | Description | Key Technology |
|---|---|---|
| **Chat Trip Planner** | Conversational trip planning with live data | OpenAI function calling |
| **Photo Analyzer** | Upload & analyze destination photos | GPT-4 Vision API |
| **Itinerary Generator** | Structured day-by-day plans with PDF export | JSON mode + Pydantic + FPDF2 |
| **Travel Guide Search** | Semantic search over curated guides | ChromaDB RAG pipeline |
| **Map & Weather** | Interactive maps, weather & cost dashboards | Folium + Plotly |

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set your OpenAI API key (or enter it in the app sidebar)
cp .env.example .env
# Edit .env and add your key

# Run the app
streamlit run app.py
```

## Architecture

```
smart-travel-planner/
├── app.py                          # Main entry point & home page
├── pages/
│   ├── 1_Chat_Trip_Planner.py      # Conversational planning + function calling
│   ├── 2_Photo_Analyzer.py         # Vision API photo analysis
│   ├── 3_Itinerary_Generator.py    # Structured itinerary + PDF export
│   ├── 4_Travel_Guide_Search.py    # RAG search with ChromaDB
│   └── 5_Map_and_Weather.py        # Folium maps + Plotly dashboards
├── utils/
│   ├── models.py                   # Pydantic data models
│   ├── openai_client.py            # OpenAI client wrapper
│   ├── function_calling.py         # Weather & pricing function definitions
│   ├── rag.py                      # ChromaDB RAG pipeline
│   ├── pdf_export.py               # PDF generation with FPDF2
│   └── map_utils.py                # Folium map utilities
├── data/
│   └── travel_guides/              # Travel guide documents (10 destinations)
├── requirements.txt
└── .env.example
```

## Key Libraries

- **streamlit** - Multi-page web application framework
- **openai** - GPT-4o-mini for chat, function calling, and vision
- **pydantic** - Data validation and structured output models
- **chromadb** - Vector database for RAG travel guide search
- **fpdf2** - PDF itinerary generation
- **folium / streamlit-folium** - Interactive map visualizations
- **plotly** - Weather and cost comparison charts
- **pandas** - Data manipulation and display
- **python-dotenv** - Environment variable management

## Covered Destinations

Paris, Tokyo, New York, London, Rome, Bangkok, Barcelona, Sydney, Dubai, Bali

Each destination has a comprehensive travel guide indexed in ChromaDB covering: overview, best time to visit, must-see attractions, hidden gems, food & dining, transportation, budget tips, and cultural tips.
