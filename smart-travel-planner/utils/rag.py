"""RAG pipeline using ChromaDB for travel guide search."""

from __future__ import annotations

import os
from pathlib import Path

import chromadb
import streamlit as st


TRAVEL_GUIDES_DIR = Path(__file__).parent.parent / "data" / "travel_guides"

COLLECTION_NAME = "travel_guides"


@st.cache_resource
def get_chroma_client() -> chromadb.ClientAPI:
    persist_dir = str(Path(__file__).parent.parent / "data" / "chroma_db")
    return chromadb.PersistentClient(path=persist_dir)


def get_or_create_collection(
    client: chromadb.ClientAPI,
) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def load_travel_guides() -> list[dict]:
    """Load travel guide documents from the data directory."""
    documents = []
    if not TRAVEL_GUIDES_DIR.exists():
        return documents

    for filepath in sorted(TRAVEL_GUIDES_DIR.glob("*.txt")):
        content = filepath.read_text(encoding="utf-8")
        chunks = _chunk_document(content, filepath.stem)
        documents.extend(chunks)

    return documents


def _chunk_document(
    content: str, source: str, chunk_size: int = 500, overlap: int = 50
) -> list[dict]:
    """Split a document into overlapping chunks."""
    chunks = []
    paragraphs = content.split("\n\n")

    current_chunk = ""
    chunk_idx = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) > chunk_size and current_chunk:
            chunks.append(
                {
                    "id": f"{source}_chunk_{chunk_idx}",
                    "text": current_chunk.strip(),
                    "metadata": {"source": source, "chunk_index": chunk_idx},
                }
            )
            chunk_idx += 1
            words = current_chunk.split()
            overlap_text = " ".join(words[-overlap:]) if len(words) > overlap else ""
            current_chunk = overlap_text + " " + para
        else:
            current_chunk = current_chunk + "\n\n" + para if current_chunk else para

    if current_chunk.strip():
        chunks.append(
            {
                "id": f"{source}_chunk_{chunk_idx}",
                "text": current_chunk.strip(),
                "metadata": {"source": source, "chunk_index": chunk_idx},
            }
        )

    return chunks


def index_documents(force_reindex: bool = False) -> int:
    """Index travel guide documents into ChromaDB."""
    client = get_chroma_client()

    if force_reindex:
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass

    collection = get_or_create_collection(client)

    if collection.count() > 0 and not force_reindex:
        return collection.count()

    documents = load_travel_guides()
    if not documents:
        return 0

    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch = documents[i : i + batch_size]
        collection.add(
            ids=[doc["id"] for doc in batch],
            documents=[doc["text"] for doc in batch],
            metadatas=[doc["metadata"] for doc in batch],
        )

    return collection.count()


def search_guides(query: str, n_results: int = 5) -> list[dict]:
    """Search travel guides using ChromaDB similarity search."""
    client = get_chroma_client()
    collection = get_or_create_collection(client)

    if collection.count() == 0:
        index_documents()
        if collection.count() == 0:
            return []

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count()),
    )

    search_results = []
    if results and results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i] if results["metadatas"] else {}
            distance = results["distances"][0][i] if results["distances"] else 0
            search_results.append(
                {
                    "text": doc,
                    "source": metadata.get("source", "unknown"),
                    "chunk_index": metadata.get("chunk_index", 0),
                    "relevance_score": round(1 - distance, 3),
                }
            )

    return search_results
