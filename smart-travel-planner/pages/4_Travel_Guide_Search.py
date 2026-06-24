"""Page 4: Travel Guide Search - RAG-powered travel guide search using ChromaDB."""

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.openai_client import chat_completion, get_openai_client
from utils.rag import index_documents, search_guides

st.set_page_config(page_title="Travel Guide Search", page_icon="📚", layout="wide")

st.title("📚 Travel Guide Search")
st.markdown(
    "Search our curated travel guides using AI-powered semantic search. "
    "Ask questions about destinations and get relevant, detailed answers."
)

if "guides_indexed" not in st.session_state:
    with st.spinner("Indexing travel guides..."):
        count = index_documents()
        st.session_state.guides_indexed = True
        st.session_state.guide_count = count

with st.sidebar:
    st.subheader("Search Settings")

    num_results = st.slider(
        "Number of results", min_value=1, max_value=10, value=5
    )

    use_ai_summary = st.checkbox(
        "AI-Enhanced Answers",
        value=True,
        help="Use AI to synthesize search results into a comprehensive answer",
    )

    st.divider()
    st.subheader("Available Guides")
    guides_dir = Path(__file__).parent.parent / "data" / "travel_guides"
    if guides_dir.exists():
        for guide_file in sorted(guides_dir.glob("*.txt")):
            dest_name = guide_file.stem.replace("_", " ").title()
            st.markdown(f"- {dest_name}")

    st.divider()
    st.caption(
        f"Knowledge base: {st.session_state.get('guide_count', 0)} indexed chunks"
    )

    if st.button("Re-index Guides", use_container_width=True):
        with st.spinner("Re-indexing..."):
            count = index_documents(force_reindex=True)
            st.session_state.guide_count = count
            st.success(f"Re-indexed {count} chunks")

st.subheader("Search Travel Guides")

example_queries = [
    "Best street food in Bangkok",
    "Free museums in London",
    "Hidden gems in Rome",
    "Transportation tips for Tokyo",
    "Budget tips for Bali",
    "Cultural etiquette in Dubai",
]

ecols = st.columns(3)
for i, query in enumerate(example_queries):
    col_idx = i % 3
    if ecols[col_idx].button(query, key=f"eq_{i}", use_container_width=True):
        st.session_state["search_query"] = query

search_query = st.text_input(
    "Ask anything about travel destinations...",
    value=st.session_state.get("search_query", ""),
    placeholder="e.g., What are the best hidden gems in Paris?",
    key="search_input",
)

if search_query:
    with st.spinner("Searching travel guides..."):
        results = search_guides(search_query, n_results=num_results)

    if not results:
        st.warning(
            "No results found. Try a different query or check that travel guides are indexed."
        )
    else:
        if use_ai_summary and get_openai_client():
            context = "\n\n---\n\n".join(
                [
                    f"[Source: {r['source'].replace('_', ' ').title()}]\n{r['text']}"
                    for r in results
                ]
            )

            with st.spinner("Generating AI-enhanced answer..."):
                response = chat_completion(
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a knowledgeable travel expert. Answer the user's question "
                                "based on the provided travel guide excerpts. Be specific, practical, "
                                "and engaging. Reference specific places, costs, and tips from the "
                                "sources. If the sources don't fully answer the question, say so "
                                "and provide what you can."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Question: {search_query}\n\nTravel Guide Excerpts:\n{context}",
                        },
                    ],
                    temperature=0.5,
                )

                if response:
                    st.subheader("AI-Enhanced Answer")
                    st.markdown(response.choices[0].message.content)
                    st.divider()

        st.subheader(f"Source Documents ({len(results)} results)")

        for i, result in enumerate(results):
            source_name = result["source"].replace("_", " ").title()
            score = result["relevance_score"]

            score_color = "green" if score > 0.5 else "orange" if score > 0.3 else "red"

            with st.expander(
                f"📖 {source_name} (Relevance: {score:.1%})",
                expanded=(i == 0),
            ):
                st.markdown(result["text"])
                st.caption(
                    f"Source: {source_name} | Chunk: {result['chunk_index']} | "
                    f"Relevance: {score:.3f}"
                )

st.divider()

st.markdown(
    """
    ### How It Works
    
    This search uses **Retrieval-Augmented Generation (RAG)** to find relevant 
    travel information:
    
    1. **Indexing**: Travel guides are split into chunks and stored in a ChromaDB 
       vector database with semantic embeddings
    2. **Search**: Your query is compared against all chunks using cosine similarity 
       to find the most relevant passages
    3. **AI Enhancement**: (Optional) The top results are sent to GPT to generate 
       a comprehensive, synthesized answer
    
    The knowledge base currently includes guides for: Paris, Tokyo, New York, 
    London, Rome, Bangkok, Barcelona, Sydney, Dubai, and Bali.
    """
)
