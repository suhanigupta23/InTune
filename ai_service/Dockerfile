FROM python:3.9-slim

WORKDIR /app

# Install build dependencies for compiling any C++ extensions safely
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download SBERT model weights during image building to prevent HuggingFace download latency at container start
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
