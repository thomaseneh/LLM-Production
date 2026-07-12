from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# from prod.backend.app.api.v1.routes.products import products
from app.core.data.products import products

# --- Load embedding model ---
model = SentenceTransformer("all-MiniLM-L6-v2")

# --- Global FAISS index ---
index = None
product_ids = []


def build_index():
    """
    Build FAISS index from current products list.
    Call this once at startup or whenever products change.
    """
    global index, product_ids

    # Build text corpus
    product_texts = [
        f"{p['name']} {p['category']} {' '.join(p['tags'])}"
        for p in products
    ]

    # Encode
    embeddings = model.encode(product_texts)
    embeddings = np.array(embeddings, dtype="float32")

    # Create FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Track product IDs
    product_ids = [p["id"] for p in products]


def semantic_search(query, k=5):
    """
    Return top-k semantically similar products.
    """
    if index is None:
        build_index()

    q_emb = model.encode([query])
    q_emb = np.array(q_emb, dtype="float32")

    distances, idxs = index.search(q_emb, k)

    results = []
    for i in idxs[0]:
        pid = product_ids[i]
        product = next(p for p in products if p["id"] == pid)
        results.append(product)

    return results
