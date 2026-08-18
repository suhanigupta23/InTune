# InTune — AI-Powered Roommate Matching Platform

Finding a compatible roommate shouldn't come down to a checkbox for "veg vs non-veg." InTune matches people by how they actually describe their lifestyle, not by ticking boxes.

**Live demo:** https://in-tune-phi.vercel.app/

---

## The Problem

Most flatmate-finding apps rely on rigid binary filters (smoker/non-smoker, veg/non-veg) that miss the actual nuance of how two people live together. On top of that, users have to reveal their real name and phone number just to start a conversation, and there's no real way to confirm someone's profile isn't fake.

## The Solution

- Users describe their lifestyle in their own words — by voice or by typing — instead of filling out a checkbox form.
- An AI model compares the *meaning* of two people's descriptions and produces a compatibility score, not just keyword matches.
- Everyone stays anonymous behind an auto-generated alias (like `Sky_412`) until both people mutually swipe right — only then are real names and contact details revealed.
- Identity documents are verified on-device using OCR and a checksum algorithm, so fake or mistyped IDs are caught automatically.

## What It Does — Feature by Feature

| Feature | What it means for the user |
|---|---|
| **Voice Onboarding** | Talk naturally about your living habits (via browser voice input or a guided AI phone-call-style widget) instead of filling a form |
| **Smart Compatibility Matching** | An AI model reads the meaning behind your description and finds people who genuinely vibe with your lifestyle, sleep schedule, and habits |
| **Anonymous-First Chat** | Message your matches under an alias — your real identity is never shown until you both agree to match |
| **ID Verification** | Uploaded ID photos are scanned and checksum-validated automatically to catch typos and fakes, without ever sending the photo to a server |
| **Expense Splitting** | Once matched, log and split shared costs with your roommate in one place |
| **Room Styling & Conflict Help** | Early-stage tools for planning shared spaces and getting advice on common roommate friction points |

## How It Works (Non-Technical)

1. **Sign up** and verify your identity with a quick ID photo scan.
2. **Describe your ideal living situation** — talk or type about your habits, schedule, and preferences.
3. **Get matched** — the app shows you compatibility scores with other verified users, broken down by category (cleanliness, sleep schedule, social habits, and more).
4. **Chat anonymously** with anyone who interests you.
5. **Mutually swipe right** to unlock each other's real name and contact details.
6. **Move in and use the tools** — split expenses, plan the room together, and get help resolving disagreements.

## How It Works (Technical)

InTune is a **3-service architecture**:

```
React (Vercel)  →  Spring Boot API (Render)  →  MongoDB
                          ↓
                  FastAPI + SBERT microservice (Render)
                          ↑
             OmniDimension voice AI (webhook callback)
```

- **Frontend** — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend API** — Java 17, Spring Boot 3, Spring Security, JWT auth, MongoDB
- **Matching Engine** — Python, FastAPI, Sentence-Transformers (`all-MiniLM-L6-v2`), computing semantic similarity via cosine distance on sentence embeddings
- **Identity Verification** — Tesseract.js (OCR, runs in-browser) + a Verhoeff checksum implementation to validate document numbers without a government API
- **Voice AI** — OmniDimension for guided voice onboarding, plus native browser speech recognition as a lighter-weight alternative

### Core algorithm, in one paragraph
Each user's lifestyle description is converted into a 384-dimensional vector by a sentence-embedding model. Two people's vectors are compared using cosine similarity — a measure of how closely their *meaning* aligns, not just their word overlap. This produces the overall compatibility score. If the matching service is temporarily unavailable, the backend falls back to a simpler keyword-overlap (Jaccard) similarity so the app degrades gracefully instead of breaking.

## Setup

```bash
git clone https://github.com/suhanigupta23/InTune.git
cd InTune

# 1. Backend (needs local MongoDB running)
cd backend
mvn spring-boot:run          # http://localhost:5001

# 2. Matching microservice
cd ../ai_service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py                # http://localhost:8000

# 3. Frontend
cd ../frontend
npm install
npm run dev                    # http://localhost:5173
```

## Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui
**Backend:** Java 17 · Spring Boot 3 · Spring Security · JWT · Spring Data MongoDB
**AI/ML:** Python 3.9 · FastAPI · Sentence-Transformers · PyTorch
**Database:** MongoDB
**Deployment:** Vercel (frontend) · Render (backend + AI service)

## Current Status

This is an actively evolving personal project. Core flows — signup, ID verification, voice onboarding, AI matching, anonymous chat, and mutual-match reveal — are fully functional end to end. Room-styling and conflict-resolution tools are early-stage/in progress.

## Roadmap

- [ ] Harden third-party sign-in verification
- [ ] Move from chat polling to real-time WebSocket delivery
- [ ] Vector-index-based matching to scale beyond brute-force comparison
- [ ] LLM-powered conflict-resolution assistant

## Author

Suhani Gupta — [GitHub](https://github.com/suhanigupta23) · [LinkedIn](https://linkedin.com/in/suhani-gupta23/) · [Portfolio](https://suhanigupta.vercel.app)
