# InTune: Code-Level Architecture & Walkthrough

This document provides a line-by-line breakdown of the core code blocks in InTune, explaining the data structures, algorithms, and logic.

---

## 🛡️ Topic 1: Aadhaar OCR & Verhoeff Checksum (in `Signup.tsx`)

### 1. The Tesseract.js OCR Worker Pipeline
When a user uploads an Aadhaar card, we run the following asynchronous function to extract text locally:
```typescript
import { createWorker } from "tesseract.js";

async function processAadhaar(file: File) {
  // 1. Initialize a Web Worker to keep the UI thread responsive
  const worker = await createWorker("eng");
  
  // 2. Feed the file to the OCR engine
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate(); // Terminate worker to free up client memory
  
  const cleanText = text.toLowerCase();
  
  // 3. Regex match to extract gender from Aadhaar text card
  let gender = "Unknown";
  if (cleanText.includes("female") || cleanText.includes("woman")) gender = "Female";
  else if (cleanText.includes("male") || cleanText.includes("man")) gender = "Male";

  // 4. Regex match to locate the 12-digit Aadhaar number
  const match = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/) || text.match(/\b\d{12}\b/);
  const rawNumber = match ? match[0].replace(/\s/g, "") : "";

  return {
    gender,
    maskedAadhaar: rawNumber ? `XXXX XXXX ${rawNumber.slice(-4)}` : "",
    isValid: rawNumber ? validateAadhaar(rawNumber) : false
  };
}
```

### 2. The Verhoeff Checksum Mathematics (`validateAadhaar`)
The Verhoeff algorithm uses dihedral group operations ($D_5$) represented by lookup tables:
* **`verhoeffTableP`**: Permutation matrix that shifts digits based on their position (index) to catch transposition errors (e.g. typing `12` instead of `21`).
* **`verhoeffTableInv`**: The inverse lookup table for digits.
* **`verhoeffTableD`**: The multiplication table for the dihedral group $D_5$.

```typescript
// Multiplication table (dihedral group D5)
const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  ...
];

// Permutation table to shift digits dynamically based on position
const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  ...
];

const verhoeffTableInv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateAadhaar(aadhaar: string): boolean {
  if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) return false;

  let c = 0;
  // Reverse the digits array to calculate positional checks
  const digits = aadhaar.split("").map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    // Multiply current state c by the permuted digit index using table D
    c = verhoeffTableD[c][verhoeffTableP[i % 8][digits[i]]];
  }

  // A valid Aadhaar check digit yields a final state of 0
  return c === 0;
}
```

---

## 🧠 Topic 2: NLP Cosine Similarity & TF-IDF (in `MatchMeter.tsx`)

This script parses the user's voice transcript and computes a matching compatibility score (55% to 98%).

```typescript
function calculateCompatibility(userVibe: string, candidateVibe: string) {
  const cleanA = userVibe.toLowerCase();
  const cleanB = candidateVibe.toLowerCase();

  // 1. Text Tokenization: Regex split on word boundaries
  const wordsA = cleanA.match(/\b\w+\b/g) || [];
  const wordsB = cleanB.match(/\b\w+\b/g) || [];

  // 2. Build Vocabulary: Set stores only unique terms
  const vocab = new Set([...wordsA, ...wordsB]);

  let overallScore = 75; // Default fallback score
  
  if (vocab.size > 0) {
    // 3. Count frequencies (Term Frequency) for vectors A and B
    const freqA: Record<string, number> = {};
    const freqB: Record<string, number> = {};
    wordsA.forEach(w => freqA[w] = (freqA[w] || 0) + 1);
    wordsB.forEach(w => freqB[w] = (freqB[w] || 0) + 1);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    // 4. Compute Vector Dot Product and Norm Magnitudes
    vocab.forEach(word => {
      const valA = freqA[word] || 0;
      const valB = freqB[word] || 0;
      
      dotProduct += valA * valB; // Accumulate dot product
      normA += valA * valA;      // Magnitude sum of squared values for A
      normB += valB * valB;      // Magnitude sum of squared values for B
    });

    // 5. Apply Cosine Similarity Formula
    if (normA > 0 && normB > 0) {
      const cosSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      // Scale cosine value (-1.0 to 1.0) into a premium score (55% to 98%)
      overallScore = Math.round(55 + cosSim * 43);
    }
  }

  return { overallScore };
}
```

---

## 💬 Topic 3: Anonymous Chat & Identity Reveal (in `Chatterbox.tsx`)

In Chatterbox, we poll message lists and resolve names based on match verification flags.

```typescript
// 1. Get match states from backend database
const matchesRes = await fetch(`${API_BASE}/auth/matches`, {
  headers: { Authorization: `Bearer ${token}` }
});
const matchesData = await matchesRes.json();

const top4Rooms = top4Candidates.map((c: any) => {
  // 2. Check if a mutual match exists in the swiped matches array
  const matchedRecord = matchesData.find((m: any) => 
    (m.swiperId === currentUser._id && m.receiverId === c._id && m.status === "matched") ||
    (m.swiperId === c._id && m.receiverId === currentUser._id && m.status === "matched")
  );

  return {
    _id: c._id,
    name: c.name,
    anonymousId: c.anonymousId,
    // 3. Resolve status flag: if matchedRecord exists, status is "matched"
    status: matchedRecord ? "matched" : "pending"
  };
});

// 4. Resolve active recipient's name in Chat header
const activeMatch = top4Rooms.find((m: any) => m._id === recipientId);
if (activeMatch) {
  // If matched, show real name. Otherwise, show anonymousId (e.g. CleanFreak_551)
  setRecipientName(activeMatch.status === "matched" ? activeMatch.name : activeMatch.anonymousId);
  setIsRevealed(activeMatch.status === "matched");
}
```

---

## 📂 Topic 4: Real-time Message Polling
To keep chatting responsive without using WebSockets (which requires paid constant-connection server resources), the chat page uses recursive intervals:

```typescript
useEffect(() => {
  const fetchChatData = async () => {
    // ... Fetching code details ...
  };

  fetchChatData();

  // Poll database matching state and chat messages every 3 seconds
  const interval = setInterval(fetchChatData, 3000);
  
  return () => clearInterval(interval); // Clear interval when page unmounts
}, [recipientId]);
```
