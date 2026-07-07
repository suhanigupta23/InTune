# 🎙️ InTune — Find Roommates on the Same Wavelength

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

> 🏆 **SheBuilds Hackathon 2025 — National Finalist (Top 1%, 1,500+ entries)**  
> Originally built for SheBuilds 2025, since extended with additional features.

🔗 **[Live Demo](https://in-tune-phi.vercel.app/)**

---

InTune is a co-living matching application that helps roommates find each other based on lifestyle compatibility. Instead of standard profile swiping, users complete a voice-based survey, their actual living preferences, lifestyle habits, and core vibes, get matched based on text similarity scoring, and verify their profiles with a client-side ID scanner.

---

## 🚀 The Core Philosophy: Why "InTune"?
Finding a roommate shouldn't be a gamble. Two people match when their schedules, habits, and lifestyles get on the **same wavelength**—or in other words, get **"InTune"**.

## 🚀 Key Features
InTune is built to remove the awkwardness of house hunting by providing an anonymous, secure platform where you match based on compatibility metrics first, verify your identities safely next, and collaborate on shared living spaces seamlessly.
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

## 🛠️ The Architecture & User Flow
## 🛠️ Tech Stack
```text
  [ Voice Onboarding ]  ──►  [ Speech-to-Text ]  ──►  [ NLP Vectorizer (TF-IDF) ]
           │                                                       │
           ▼                                                       ▼
  [ Aadhaar Upload ]   ──►  [ OCR RNN Scanning ]  ──►  [ Match Room compatibility ]
           │                         │                             │
           ▼                         ▼                             ▼
  [ Verhoeff Check ]   ──►  [ Verification Pass ] ──►  [ Cosine Similarity Meter ]
                                                                   │
                                                                   ▼
                                                       [ Locked Anonymous Chat ]
                                                                   │
                                                       [ Swiped Right Mutual Match ]
                                                                   │
                                                                   ▼
                                                       [ Real Identity Reveal! ]
                                                                   │
                                                       [ Shared Ledger & splits ]
```
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas (Mongoose).
* **Authentication**: JWT (JSON Web Tokens) & BcryptJS.
* **Libraries**: Tesseract.js (Client-side text recognition).

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/your-username/intune.git
cd intune
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. **Run the app**
```bash
# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

---

## ✨ Key Technical Features

### 🎙️ 1. AI Voice-Vibe Onboarding (Speech-to-Text)
* **How it works**: Users answer key lifestyle questions via voice recording directly in the browser. 
* **Under the hood**: The system uses real-time Web Speech deep neural networks to transcribe unstructured audio streams into rich text profiles, capturing the authentic tone, habits, and preferences of the user.
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
### 🧠 2. NLP Cosine Similarity Match Engine
* **How it works**: Profiles are analyzed and matched against other candidates, displaying compatibility scores from 55% to 98%.
* **Under the hood**: 
  * Converts text answers into numerical vectors using **TF-IDF (Term Frequency-Inverse Document Frequency)** models.
  * Calculates the dot-product similarity (Cosine Similarity) of the vector spaces:
    $$\text{Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
  * Generates separate lifestyle category scores (Cleanliness, Sleep Schedule, Social Habits, Food, and Lifestyle) using keyword-overlap classifiers.
### 🛡️ 3. Client-Side Computer Vision ID Verification (Aadhaar OCR)
* **How it works**: To ensure a safe community (gated only to verified female students initially), users upload their Aadhaar card.
* **Under the hood**: 
  * Runs a client-side **LSTM Recurrent Neural Network (Tesseract.js)** in the browser to perform OCR without leaking data to third-party APIs.
  * Validates the 12-digit number against the **Verhoeff Checksum Algorithm** (a mathematical dihedral group $D_5$ error detection formula) to check for valid card inputs and fake formats.
### 💬 4. Chatterbox (Anonymous Identity Reveal Chat)
* **How it works**: Top matching roommates are placed in an anonymous chat lounge. Real names are hidden behind auto-generated aliases (e.g. `River_452` or `Moon_883`).
* **Under the hood**: Once a mutual right-swipe occurs, the backend database resolves their matches status to `matched` and unlocks their real profiles and verified names instantly in real-time.
### 🛏️ 5. StyleMatch & Splits Ledger (Collaborative Living)
* **How it works**: A centralized suite for verified roommates to plan room decor templates and split shared living costs (utilities, rent, grocery ledgers).
* **Under the hood**: Peer-to-peer balance tracking connected to the matching database schema.

---

## 💻 Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion (premium swipe animations), Radix UI.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas, Mongoose ODM.
* **Auth**: JSON Web Tokens (JWT), BcryptJS.
* **Libraries**: Tesseract.js (Computer Vision OCR).
