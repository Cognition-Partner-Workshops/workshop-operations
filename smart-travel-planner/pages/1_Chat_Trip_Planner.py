"""Page 1: Chat-based Trip Planner - Conversational travel planning with function calling."""

import json
import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.demo_mode import get_demo_chat_response
from utils.function_calling import FUNCTION_TOOLS, process_tool_calls
from utils.openai_client import SYSTEM_PROMPT, chat_completion, get_openai_client

st.set_page_config(page_title="Chat Trip Planner", page_icon="\U0001f4ac", layout="wide")

st.title("\U0001f4ac Chat Trip Planner")
st.markdown(
    "Plan your perfect trip through conversation. Ask about destinations, "
    "get weather forecasts, compare prices, and receive personalized recommendations."
)

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "assistant",
            "content": (
                "Hello! I'm your AI travel planner. I can help you plan trips, "
                "check weather conditions, compare travel costs, and give you "
                "personalized recommendations.\n\n"
                "Try asking me things like:\n"
                '- "Plan a 5-day trip to Tokyo on a moderate budget"\n'
                '- "What\'s the weather like in Paris right now?"\n'
                '- "How much would a week in Bali cost?"\n'
                '- "Compare prices for London vs Barcelona"\n\n'
                "Where would you like to go?"
            ),
        }
    ]


for msg in st.session_state.chat_messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask me about your trip..."):
    st.session_state.chat_messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    client = get_openai_client()

    with st.chat_message("assistant"):
        if client is None:
            with st.spinner("Thinking (demo mode)..."):
                assistant_content = get_demo_chat_response(prompt)
                st.markdown(assistant_content)
                st.session_state.chat_messages.append(
                    {"role": "assistant", "content": assistant_content}
                )
        else:
            with st.spinner("Thinking..."):
                messages = [{"role": "system", "content": SYSTEM_PROMPT}] + [
                    {"role": m["role"], "content": m["content"]}
                    for m in st.session_state.chat_messages
                ]

                response = chat_completion(
                    messages=messages,
                    tools=FUNCTION_TOOLS,
                    temperature=0.7,
                )

                if response is None:
                    st.error("Failed to get a response. Please check your API key.")
                    st.stop()

                message = response.choices[0].message

                if message.tool_calls:
                    st.info("Fetching live data...")

                    tool_results = process_tool_calls(response)

                    messages.append(
                        {
                            "role": "assistant",
                            "content": message.content or "",
                            "tool_calls": [
                                {
                                    "id": tc.id,
                                    "type": "function",
                                    "function": {
                                        "name": tc.function.name,
                                        "arguments": tc.function.arguments,
                                    },
                                }
                                for tc in message.tool_calls
                            ],
                        }
                    )
                    messages.extend(tool_results)

                    for result in tool_results:
                        data = json.loads(result["content"])
                        fn_name = result["name"]
                        if fn_name == "get_weather":
                            with st.expander("Weather Data", expanded=False):
                                col1, col2, col3 = st.columns(3)
                                col1.metric(
                                    "Temperature",
                                    f"{data['temperature_celsius']}\u00b0C",
                                    f"{data['temperature_fahrenheit']}\u00b0F",
                                )
                                col2.metric("Condition", data["condition"])
                                col3.metric("Humidity", f"{data['humidity']}%")
                        elif fn_name == "get_pricing":
                            with st.expander("Pricing Data", expanded=False):
                                col1, col2, col3 = st.columns(3)
                                col1.metric("Flight", data["flight_estimate"])
                                col2.metric("Hotel/Night", data["hotel_per_night"])
                                col3.metric("Meals", data["meal_average"])

                    follow_up = chat_completion(messages=messages, temperature=0.7)
                    if follow_up:
                        assistant_content = follow_up.choices[0].message.content
                    else:
                        assistant_content = "I fetched the data but couldn't generate a response."
                else:
                    assistant_content = message.content

                st.markdown(assistant_content)
                st.session_state.chat_messages.append(
                    {"role": "assistant", "content": assistant_content}
                )

with st.sidebar:
    st.subheader("Chat Controls")
    if st.button("Clear Chat History", use_container_width=True):
        st.session_state.chat_messages = [
            {
                "role": "assistant",
                "content": (
                    "Chat cleared! Where would you like to travel? "
                    "I can help with destinations, weather, pricing, and itineraries."
                ),
            }
        ]
        st.rerun()

    st.divider()
    st.markdown("**Quick Prompts:**")
    quick_prompts = [
        "Plan a romantic getaway to Paris",
        "Best family-friendly destinations in Asia",
        "Budget backpacking trip to Southeast Asia",
        "What's the weather in Tokyo this week?",
        "Compare costs: Rome vs Barcelona",
    ]
    for qp in quick_prompts:
        if st.button(qp, key=f"qp_{qp}", use_container_width=True):
            st.session_state["_pending_prompt"] = qp
            st.rerun()

if "_pending_prompt" in st.session_state:
    prompt = st.session_state.pop("_pending_prompt")
    st.session_state.chat_messages.append({"role": "user", "content": prompt})
    st.rerun()
