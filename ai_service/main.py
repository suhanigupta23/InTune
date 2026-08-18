import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from typing import List

app = FastAPI(title="InTune SBERT Similarity Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load SBERT model on startup (approx. 90MB)
model_name = "sentence-transformers/all-MiniLM-L6-v2"
print(f"Loading SBERT model: {model_name}...")
model = SentenceTransformer(model_name)
print("SBERT model loaded successfully!")

class SimilarityRequest(BaseModel):
    anchor: str
    candidates: List[str]

@app.get("/")
def read_root():
    return {"status": "healthy", "model": model_name}

@app.post("/api/similarity")
def calculate_similarity(request: SimilarityRequest):
    if not request.anchor.strip():
        # If user has no vibe text, return default/neutral compatibility
        return {"scores": [50.0] * len(request.candidates)}
    
    if not request.candidates:
        return {"scores": []}
    
    try:
        # Encode sentences into high-dimensional vector embeddings
        anchor_embedding = model.encode(request.anchor, convert_to_tensor=True)
        candidate_embeddings = model.encode(request.candidates, convert_to_tensor=True)
        
        # Calculate cosine similarity dot products
        cosine_scores = util.cos_sim(anchor_embedding, candidate_embeddings)[0]
        
        # Scale scores from [-1, 1] to [55, 98] range to fit InTune UX compatibility scaling
        scaled_scores = []
        for score in cosine_scores:
            val = float(score)
            # Clip between -1.0 and 1.0 to prevent domain errors
            val = max(-1.0, min(1.0, val))
            # Shift from [-1, 1] -> [0, 1], then map to [55, 98]
            shifted = (val + 1.0) / 2.0
            ux_score = 55.0 + (shifted * 43.0)
            scaled_scores.append(round(ux_score, 1))
            
        return {"scores": scaled_scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SBERT similarity check failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
