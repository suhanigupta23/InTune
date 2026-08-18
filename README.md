# 🎙️ InTune — AI-Powered Roommate Matching Platform

> *"Finding a roommate shouldn't just be about sharing rent—it's about matching frequencies."*

---

## 🎵 Why "InTune"?
Finding the right roommate is like playing in an orchestra. If one instrument is out of key, the entire symphony is disrupted. The name **InTune** represents helping co-living flatmates align their living habits, sleeping rhythms, hygiene standards, and social vibes to live in complete harmony.

---

## ⚠️ The Problem
Traditional flatmate search apps rely on rigid, superficial checklists (e.g., "Veg vs. Non-Veg" or "Smoker vs. Non-Smoker"). These binary choices fail to capture the nuances of daily human living. 
* **Superficial Filters**: Checking identical boxes doesn't mean two personalities match.
* **Safety Concerns**: Revealing real identities and contact information immediately during initial contact exposes users to privacy risks.
* **Typo/Invalid Identity Profiles**: Manual verification of profile claims leads to fraudulent or invalid listings.

---

## 💡 The Solution
InTune solves this by replacing flat profiles with a dynamic, voice-first semantic onboarding process:
* **Voice Bio Analysis**: Users talk freely about their expectations, which are transcribed into natural language bios.
* **Semantic Compatibility**: Instead of keyword matching, an AI engine analyzes the *meaning* and *vibe* of the text bios.
* **Anonymous Verification**: Roommates interact anonymously under generated aliases. Real credentials (name, phone, email, Aadhaar) are hidden and **only revealed upon mutual swipe likes**.

---

## 🛠️ Technical Features & Algorithms

* **🧠 SBERT Vector Similarity (FastAPI)**: Converts user voice bios into high-dimensional dense vector embeddings using the `all-MiniLM-L6-v2` SentenceTransformer model. Roommate compatibility is computed using **Cosine Similarity** dot products, scaled into a natural $[55\%, 98\%]$ percentage.
* **🔒 Verhoeff Checksum Algorithm (Java)**: Validates Aadhaar card identification numbers during OCR profile verification to prevent typos and spoofed cards.
* **🧩 Mutual-Reveal State Machine**: Manages likes and swipes. When a double swipe-right occurs, the backend transitions the match status to `matched`, securely revealing contact credentials.
* **💵 Splitmate shared ledger**: A co-living expense splitter ledger to log, split, and divide flat costs.
* **📐 StyleMatch floor designer**: Interactive layout planners to design joint flats.

---

## ⚙️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Lucide.
* **Backend**: Java 17, Spring Boot 3, Spring Security, JWT, Spring Data MongoDB.
* **AI Service**: Python 3.9, FastAPI, SentenceTransformers, PyTorch.

## ⚙️ Clone & Local Setup

### 1. Clone the Repository
```bash
git clone git@github.com:suhanigupta23/InTune.git
cd InTune
```

### 2. Run Java Spring Boot Backend (Port 5001)
Make sure local MongoDB is running:
```bash
cd backend
mvn spring-boot:run
```

### 3. Run SBERT AI Microservice (Port 8000)
```bash
cd ai_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 4. Run Vite React Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
