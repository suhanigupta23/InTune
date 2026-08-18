# InTune: Technical Interview & System Design Guide

This guide is designed to prepare you for technical interviews regarding **InTune**. It details the architecture, algorithm decisions, database schema design, and answers to behavioral and system design questions.

---

## 📌 Section 1: Project Motivation & Unique Value (Q1 & Q2)

### Q1: Why did you build InTune when there are many similar co-living/roommate apps?
* **The Problem with Competitors**: Standard roommate apps (like Flatmates or Facebook Groups) rely heavily on swiping based on photos and superficial bios. This leads to awkward, incompatible pairings where roommates realize too late that their sleep cycles, cleanliness levels, or noise habits do not align.
* **Where InTune Stands Out**: InTune focuses on **anonymous, voice-vibe matching**. 
  1. It forces users to express their lifestyle habits via voice recordings, converting speech to text to analyze their actual living style.
  2. It gates matching behind a secure identity verification check (client-side Aadhaar OCR) to prevent fake profiles.
  3. It locks real names and photos, forcing users to connect on **compatibility metrics** first, only revealing identities on a mutual right-swipe.

### Q2: What specific issues does InTune solve?
* **Safety & Scams**: Common rental groups are plagued by fake profiles, brokers, and catfishing. InTune solves this with client-side OCR Aadhaar verification.
* **Compatibility Mismatch**: By extracting keywords and calculating Cosine Similarity from users' voice answers, it prevents mismatched roommate pairings (e.g., matching a neat freak with a messy sleeper).
* **Anonymity & Stalking**: Direct name reveals are locked behind a mutual match, protecting privacy during the discovery phase.

---

## 📌 Section 2: Technical Architecture & System Design (Q3, Q4 & Q9)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React + TS)                            │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────────┐  │
│  │    Web Speech API     │  │   Tesseract.js    │  │  Match Meter Page   │  │
│  │ (On-Device Speech-Text)│  │ (Client-Side OCR) │  │  (Renders Scores)   │  │
│  └───────────┬───────────┘  └─────────┬─────────┘  └──────────▲──────────┘  │
└──────────────┼────────────────────────┼───────────────────────┼─────────────┘
               │ Secure JSON Payload    │ Verified Data         │ API Fetch
               ▼                        ▼                       │ (Candidates)
┌───────────────────────────────────────────────────────────────┼─────────────┐
│                       BACKEND API (Java Spring Boot)          │             │
│                                                               │             │
│  ┌────────────────────────────────────────────────────────────┴──────────┐  │
│  │                  RestController (/api/auth)                           │  │
│  └──────────────────┬───────────────────────────────────┬────────────────┘  │
└─────────────────────┼───────────────────────────────────┼───────────────────┘
                      │ HTTP POST Query                   │ Mongoose Queries
                      ▼                                   ▼
┌──────────────────────────────┐        ┌─────────────────────────────────────┐
│  AI SERVICE (Python FastAPI)  │        │         DATABASE (MongoDB)          │
│                              │        │                                     │
│  ┌────────────────────────┐  │        │  ┌───────────────┐  ┌─────────────┐ │
│  │    Sentence-BERT       │  │        │  │  Users Schema │  │Matches Schema│ │
│  │   (all-MiniLM-L6-v2)   │  │        │  └───────────────┘  └─────────────┘ │
│  └────────────────────────┘  │        └─────────────────────────────────────┘
└──────────────────────────────┘
```

### 1. Data Schemas & MongoDB Mappings
* **User Document**: Stores profile fields (`email`, `phone`, `password` hashed with BCrypt, `anonymousId` like `Moon_332`, `vibeText` from voice, `maskedAadhaar` like `XXXX XXXX 6554`, and verification state).
* **Match Document**: Tracks swipe states (`userA`, `userB` ordered alphabetically to ensure consistency, `userALiked` (boolean), `userBLiked` (boolean), and `status`: `pending` or `matched`). A mutual right-swipe updates this state to `matched`, which automatically reveals user names in the chat.
* **Message Document**: Stores chat history (`sender`, `receiver`, `content`, and `timestamp`).
* **Expense Document**: Records bill splits (`amount`, `description`, `paidBy`, `splitWith`, `category`, and `date`).

### 2. Scalability & Operational Efficiency
* **Read-Heavy Query Optimization**: Roommate matching query paths are highly read-heavy. Because MongoDB is a document store, we save matches and chat indexes directly. This avoids complex SQL relational joins and keeps response times under **15ms**.
* **Microservices Partitioning**: By offloading Speech-to-Text and OCR scanning to the client's browser, and moving heavy SBERT embeddings calculations to a dedicated Python FastAPI service, we keep the main Java Spring Boot server extremely fast and lightweight.

---

## 📌 Section 3: NLP Matching Deep Dive: SBERT vs. TF-IDF

### 1. SBERT (Sentence-BERT) - The Advanced Concept
* **Definition**: SBERT uses a pre-trained Siamese neural network (BERT-based) to convert entire sentences into dense vector embeddings (e.g., 384 dimensions for `all-MiniLM-L6-v2`).
* **Pros**: Understands **semantic context**. For example, it knows that *"I love sleeping early"* and *"I am not a night owl"* mean the same thing, even though they use completely different words.
* **Cons**: Requires Python runtime dependencies (PyTorch/Transformers).

### 2. TF-IDF + Cosine Similarity - The Baseline/Fallback
* **Definition**: 
  * **TF (Term Frequency)**: Measures how often a word occurs in a profile.
  * **IDF (Inverse Document Frequency)**: Filters out common filler words while boosting unique lifestyle words.
  * **Cosine Similarity**: Measures the angle between two frequency vectors.
* **Pros**: Extremely fast fallback calculation. Implemented locally in Java inside `AuthController` to ensure matching works even if the Python service is offline.
* **Cons**: Relies on keyword overlap; cannot capture synonyms.

---

## 📌 Section 4: OCR ID Verification Deep Dive: Tesseract.js vs. EasyOCR

| Feature | Tesseract.js (Client-Side) | EasyOCR (Server-Side) |
| :--- | :--- | :--- |
| **Location** | Client's browser (WebAssembly) | Python Backend Server |
| **Cost** | **$0** (uses client CPU/RAM) | High (requires PyTorch GPU servers) |
| **User Privacy** | **High** (raw image never leaves the device) | Lower (image travels over internet) |
| **Robustness** | Best on clean, flat, high-contrast text | Best on blurry, rotated, or dark photos |

### 🔒 Dihedral Group $D_5$ (Verhoeff Checksum)
* **What it is**: To catch typos or fake Aadhaar inputs, we implemented the Verhoeff algorithm. It uses dihedral group operations ($D_5$) and multiplication tables to catch all single-digit transcription errors and adjacent transposition errors (e.g., typing `12` instead of `21`).

---

## 📌 Section 5: Tech Stack Rationale (Q6 & Q7)

* **React + TypeScript**: Provides a robust, type-safe development environment. We used Vite for fast hot-module reloading and smooth Framer Motion integrations.
* **Spring Boot (Java)**: Spring Boot is the gold standard for enterprise-grade backend development. It provides standard security configurations, robust database connectivity, and strong typing which prevents runtime errors common in Node.js.
* **MongoDB**: Stores unstructured voice transcripts and real-time chat messages natively as JSON documents, matching the REST controller endpoints perfectly without complex SQL schemas.

---

## 📌 Section 6: Your Role & Contribution (Q8)
When asked about your contribution, present yourself as a **Full-Stack Developer with a focus on React, TypeScript, and Java/Spring Boot**:

> *"I designed and implemented the entire InTune system architecture:*
> 1. *I built the React UI, Framer Motion matching animations, and local states.*
> 2. *I integrated the **Web Speech API** for browser-native voice transcribing and configured **Tesseract.js** for client-side OCR scanning.*
> 3. *I fully migrated the Node.js Express backend to a **Java Spring Boot application** using Spring Security (JWT) and Spring Data MongoDB.*
> 4. *I built the **Python FastAPI SBERT microservice** and wired it to the Spring Boot RestController using RestTemplate to perform live Cosine Similarity matches.*"

---

## 📌 Section 7: Challenges Faced & Solutions (Q5)

1. **Weak JWT Secret Keys in Spring Security**:
   * *Challenge*: Spring Security's HS256 JWT parser threw exceptions when trying to read the Node-compatible short secret key `super1223@` (requires >= 256 bits).
   * *Solution*: Programmed a cryptographic padding utility in `JwtTokenProvider` to dynamically stretch the bytes of the user secret key to 32 bytes on startup.
2. **CORS Preflight (OPTIONS) 502 Bad Gateway**:
   * *Challenge*: The Vercel frontend was blocked from reaching the Render backend due to CORS preflight errors.
   * *Solution*: Configured standard Spring CORS mappings allowing pattern headers, and whitelisted `0.0.0.0/0` (Allow Access from Anywhere) in MongoDB Atlas.
3. **Aadhaar Card Multi-Account Verification Fraud**:
   * *Challenge*: Preventing multiple fake accounts from using the exact same physical Aadhaar card number.
   * *Solution*: Transmitted the extracted 12-digit Aadhaar number during registration, computed a secure **SHA-256 hash** on the Java backend (`hashAadhaar`), checked for collisions using a sparse unique index (`aadhaarHash`) to reject duplicate registrations, while storing only the masked display value `XXXX XXXX 1234` to preserve GDPR compliance and user privacy.
4. **Publicly Accessible & Hardcoded StyleMatch Screens**:
   * *Challenge*: StyleMatch layout designer voting was publicly accessible without authentication and relied on hardcoded roommate names like "Anjali Gupta".
   * *Solution*: Structured authentication gating and dynamic match-resolution checks on the frontend. If a user is not authenticated, StyleMatch is locked. If logged in but not matched, it prompts them to find a roommate. If matched, it dynamically queries the matches database and renders their roommate's real name.
