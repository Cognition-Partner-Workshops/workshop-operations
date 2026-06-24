"""Page 2: Destination Photo Analyzer - Analyze travel photos using GPT-4 Vision."""

import base64
import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.openai_client import get_openai_client, vision_completion

st.set_page_config(page_title="Photo Analyzer", page_icon="📸", layout="wide")

st.title("📸 Destination Photo Analyzer")
st.markdown(
    "Upload a photo of any travel destination and get AI-powered analysis including "
    "location identification, nearby attractions, travel tips, and best times to visit."
)

ANALYSIS_PROMPT = """Analyze this travel/destination photo and provide a detailed response in the following format:

**Location Identified:** [Identify the specific location, landmark, or area shown]

**Landmarks Visible:** [List any recognizable landmarks, buildings, or natural features]

**Scene Description:** [Describe what's happening in the photo - the atmosphere, time of day, season, etc.]

**Travel Tips:**
- [Tip 1 related to visiting this place]
- [Tip 2]
- [Tip 3]

**Best Time to Visit:** [Recommend the ideal season/time to visit based on what you see]

**Nearby Attractions:**
- [Attraction 1 near this location]
- [Attraction 2]
- [Attraction 3]

**Estimated Daily Budget:** [Rough estimate for visiting this area]

If you cannot identify the exact location, make your best guess based on architectural style, 
vegetation, signage, and other visual clues. Be specific and helpful for someone planning to visit."""


def _check_api_key() -> bool:
    client = get_openai_client()
    if client is None:
        st.warning(
            "Please enter your OpenAI API key in the sidebar on the Home page to use photo analysis."
        )
        return False
    return True


col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Upload Photo")
    uploaded_file = st.file_uploader(
        "Choose a destination photo",
        type=["jpg", "jpeg", "png", "webp"],
        help="Upload a photo of a travel destination, landmark, or scenic location.",
    )

    if uploaded_file:
        st.image(uploaded_file, caption="Uploaded Photo", use_container_width=True)

        custom_question = st.text_area(
            "Any specific questions about this destination? (optional)",
            placeholder="E.g., What are the best restaurants nearby? Is it safe to visit at night?",
        )

        analyze_btn = st.button(
            "Analyze Photo", type="primary", use_container_width=True
        )
    else:
        analyze_btn = False
        st.info(
            "Upload a photo of any travel destination to get AI-powered insights, "
            "travel tips, and nearby attraction recommendations."
        )

with col2:
    st.subheader("Analysis Results")

    if uploaded_file and analyze_btn:
        if not _check_api_key():
            st.stop()

        with st.spinner("Analyzing your photo..."):
            image_bytes = uploaded_file.getvalue()
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            prompt = ANALYSIS_PROMPT
            if custom_question:
                prompt += f"\n\nAlso answer this specific question: {custom_question}"

            result = vision_completion(image_base64=image_base64, prompt=prompt)

            if result:
                st.session_state["last_photo_analysis"] = result
                st.markdown(result)
            else:
                st.error(
                    "Failed to analyze the photo. Please check your API key and try again."
                )

    elif "last_photo_analysis" in st.session_state:
        st.markdown(st.session_state["last_photo_analysis"])
    else:
        st.markdown(
            """
            ### How it works
            1. **Upload** a photo of any travel destination
            2. **AI analyzes** the image to identify the location
            3. **Get insights** including:
               - Location identification
               - Landmark recognition
               - Travel tips and recommendations
               - Best time to visit
               - Nearby attractions
               - Budget estimates
            
            ### Tips for best results
            - Use clear, well-lit photos
            - Include recognizable landmarks or architecture
            - Landscape/wide shots work better than close-ups
            - Photos with text/signs help with location identification
            """
        )

st.divider()
st.markdown(
    """
    <div style="text-align: center; color: #666; font-size: 0.85em;">
        Photo analysis is powered by GPT-4 Vision. Results are AI-generated 
        and should be verified before making travel plans.
    </div>
    """,
    unsafe_allow_html=True,
)
