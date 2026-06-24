"""OpenAI client wrapper for the Smart Travel Planner."""

from __future__ import annotations

import os
from typing import Optional

import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

SYSTEM_PROMPT = """You are an expert travel planner and concierge. You help users plan
amazing trips by providing detailed, practical advice about destinations, activities,
local customs, transportation, budgets, and more. You are enthusiastic but practical,
always considering the user's preferences and constraints.

When discussing destinations, include:
- Must-see attractions and hidden gems
- Local food recommendations
- Transportation tips
- Cultural etiquette
- Budget considerations
- Safety tips

Be conversational, helpful, and specific. Use your knowledge to provide actionable
travel advice."""


def get_openai_client() -> Optional[OpenAI]:
    api_key = st.session_state.get("openai_api_key") or os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("sk-your"):
        return None
    return OpenAI(api_key=api_key)


def chat_completion(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    tools: Optional[list[dict]] = None,
    response_format: Optional[dict] = None,
) -> Optional[str]:
    client = get_openai_client()
    if not client:
        return None

    kwargs: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if tools:
        kwargs["tools"] = tools
    if response_format:
        kwargs["response_format"] = response_format

    response = client.chat.completions.create(**kwargs)
    return response


def vision_completion(
    image_base64: str,
    prompt: str,
    model: str = "gpt-4o-mini",
) -> Optional[str]:
    client = get_openai_client()
    if not client:
        return None

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}",
                        },
                    },
                ],
            }
        ],
        max_tokens=1500,
    )
    return response.choices[0].message.content
