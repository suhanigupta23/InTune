# 🎙️ InTune — Roommate Matching App

InTune is a co-living matching application that helps roommates find each other based on lifestyle compatibility. Instead of standard profile swiping, users complete a voice-based survey, get matched based on text similarity scoring, and verify their profiles with a client-side ID scanner.

---

## 🚀 Key Features

* **Voice Onboarding**: Users speak their answers to living preference questions. The app transcribes the audio to text using the browser's native Web Speech API.
* **Compatibility Scoring**: Calculates matching scores (55% to 98%) between profiles using a client-side text analysis script:
  * Tokenizes transcripts and runs a **TF-IDF vector matching** script.
  * Calculates **Cosine Similarity** to check how close two profiles' descriptions are.
  * Filters key terms for custom category scores (Cleanliness, Sleep, Social, Lifestyle, Food).
* **Aadhaar OCR Verification**: Users upload an Aadhaar image to verify their profile. 
  * Uses **Tesseract.js** in the browser to extract text.
  * Runs the **Verhoeff Checksum Algorithm** locally on the 12-digit number to check for typos/invalid cards.
* **Anonymous Chatterbox**: Users start chatting anonymously (using aliases like `Sky_104`). Real names are hidden and only revealed when both users swipe right on each other.
* **StyleMatch & Splits**: Integrated room layout planning templates and a shared expense ledger to add and split co-living costs.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas (Mongoose).
* **Authentication**: JWT (JSON Web Tokens) & BcryptJS.
* **Libraries**: Tesseract.js (Client-side text recognition).

---

## 📂 Repository Structure

```text
├── backend/            # Express API, authentication, database schemas, and seed script
│   ├── src/
│   │   ├── controllers/# Registration, login, chat, and splits handlers
│   │   ├── models/     # User, Match, Message, and Expense schemas
│   │   └── seed.js     # Script to populate sample roommates in MongoDB
│   └── server.js       # Main server entry point
│
└── frontend/           # React + TypeScript single-page application
    ├── src/
    │   ├── components/ # Navbar, VoiceMatch UI section
    │   ├── pages/      # Onboarding, Dashboard, MatchMeter, Chatterbox, Splits, StyleMatch
    │   └── lib/        # API request wrappers
```
