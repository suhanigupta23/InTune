# InTune Interview Knowledge Base

> Repository-grounded technical and interview reference for InTune.
>
> This document is based on the source files currently present in the repository. It deliberately separates confirmed implementation facts from reasonable inferences, README claims, and improvements that are not currently implemented.

## How to read this document

The labels below are important:

- **Confirmed from code** means the repository directly proves the statement.
- **README claim** means the README says it, but the implementation may be incomplete or different.
- **Likely/inference** means the exact original motivation is not documented; the explanation is technically reasonable.
- **Not implemented / not identifiable** means the repository does not contain evidence for the feature.

The safest interview habit is to say what the current code does first, then explain the design rationale, then mention limitations.

---

# 1. Project overview

## Project name

**InTune**

## One-line description

InTune is an AI-assisted roommate matching platform that compares users' lifestyle descriptions, lets them communicate under anonymous aliases, and reveals profile details after mutual matching.

## The problem it solves

Traditional roommate-finding applications often use rigid filters such as “vegetarian,” “smoker,” “clean,” or “early riser.” Those filters do not capture the nuance of how people actually live together.

InTune lets users describe their habits in natural language or through voice. The system uses a sentence-embedding model to compare the meaning of those descriptions. It also tries to reduce the risk of exposing a user's identity too early by using an anonymous ID before mutual agreement.

## Target users

The intended users appear to be students or young adults looking for compatible roommates. The current signup UI blocks users whose OCR result says `Male`, and presents the application as open to female students. This product restriction is implemented in the frontend; it is not a general authorization rule enforced by the backend.

## Main features actually visible in the repository

- Email/password registration and login.
- A Google-login-shaped flow, but not real Google OAuth verification.
- Browser-side identity-document OCR using Tesseract.js.
- Browser-side Verhoeff checksum validation.
- SHA-256 hashing of the extracted identity number before database storage.
- Anonymous IDs such as `Sky_412`.
- Lifestyle profile storage through `vibeText`.
- Native browser speech recognition as one input path.
- OmniDimension voice widget integration and webhook handling.
- Candidate retrieval and semantic compatibility scoring.
- FastAPI + Sentence Transformers matching service.
- Jaccard word-overlap fallback when the AI service fails.
- Like/swipe-right state stored in MongoDB.
- Mutual-match status.
- Chat message storage and periodic polling from the frontend.
- Expense creation and retrieval between two users.
- Frontend room-styling, gallery, and GuideBot experiences.
- Vercel frontend deployment configuration.
- Dockerfiles for the Spring Boot and FastAPI services.

## Important boundaries

- **No backend service package exists.** Business logic is currently placed mostly in controllers.
- **No WebSocket or WebRTC implementation exists.** Chat uses HTTP history requests and frontend polling every three seconds.
- **No real payment provider exists.** `PaymentSection.tsx` contains frontend QR/payment-app UI, but there is no Stripe, Razorpay, PayPal, payment API, payment webhook, or backend payment transaction.
- **No vector database exists.** Embeddings are generated on demand by the FastAPI service.
- **No test source files are present.** The backend has the Spring test dependency, but no repository test files were found.
- **No real Google OAuth verification exists.** The current Google flow sends a client-selected email to the backend.

## Technology stack

| Area | Confirmed technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling/UI | Tailwind CSS, shadcn-style local components, Radix UI dependencies, Lucide React |
| Frontend routing | React Router DOM |
| Frontend state/API | React hooks, localStorage/sessionStorage, `fetch`; React Query provider is installed but no meaningful `useQuery`/`useMutation` usage was found |
| Backend language | Java 17 |
| Backend framework | Spring Boot 3.3.2 |
| Backend API | Spring Web REST controllers |
| Authentication | Spring Security, JWT via JJWT 0.11.5, BCrypt password hashing |
| Database | MongoDB through Spring Data MongoDB |
| AI service | Python, FastAPI, Uvicorn, Sentence Transformers, PyTorch indirectly through Sentence Transformers |
| AI model | `sentence-transformers/all-MiniLM-L6-v2` |
| OCR | Tesseract.js in the browser |
| Identity checksum | Verhoeff algorithm implemented in `Signup.tsx` |
| Voice | Browser SpeechRecognition plus OmniDimension external widget |
| Deployment | Vercel configuration for frontend; Render-oriented Dockerfiles/configuration for backend and AI service |
| Containerization | Dockerfiles for Spring Boot and FastAPI |

---

# 2. Interview explanations

## 30-second explanation

> InTune is a roommate matching application. Instead of relying only on fixed filters, users describe their lifestyle in text or through voice. The React frontend sends profile and matching requests to a Spring Boot backend, which stores users, matches, chat messages, and expenses in MongoDB. For matching, Spring Boot calls a separate Python FastAPI service that uses Sentence Transformers and cosine similarity to compare lifestyle descriptions. Users initially interact using anonymous IDs, and a mutual like changes the match state to `matched`, after which the backend returns real profile details.

## 1-minute explanation

> InTune addresses the problem that traditional roommate applications do not capture the details of how people actually live together. A user registers, completes browser-side document OCR and checksum validation, and describes habits such as sleep schedule, cleanliness, guests, and social preferences. The frontend is React and TypeScript, while the main backend is Spring Boot with Spring Security and JWT authentication. MongoDB stores the application documents. When the user requests candidates, Spring Boot loads verified users and sends their lifestyle descriptions to a separate FastAPI service. That service converts the text into 384-dimensional embeddings using `all-MiniLM-L6-v2`, calculates cosine similarity, scales the values into the app's compatibility range, and returns scores. If the service is unavailable, the backend falls back to Jaccard word overlap. Chat is stored through HTTP APIs and polled by the frontend, and mutual likes create a confirmed match that unlocks real profile information.

## 2–3 minute explanation

> InTune is designed around a consent-first roommate discovery flow. The product problem is that checkbox-style roommate searches can miss the nuance of lifestyle compatibility, and users may not want to expose their real identity before they know whether another person is a good fit. The application therefore combines natural-language lifestyle descriptions, semantic similarity, anonymous IDs, and mutual matching.
>
> The frontend is a React 18 and TypeScript single-page application built with Vite and styled with Tailwind and local shadcn-style components. It handles registration, login, OCR, browser speech recognition, the OmniDimension widget, candidate display, chat screens, and expense screens. It stores the JWT in `localStorage` and attaches it as a Bearer token to authenticated requests.
>
> The main backend is a Java 17 Spring Boot application. `AuthController` handles registration, login, profile updates, candidate retrieval, likes, and confirmed matches. `ChatController` stores and retrieves messages. `ExpenseController` stores and retrieves expenses. `WebhookController` receives OmniDimension callbacks and updates a user's lifestyle text. Spring Security installs `JwtAuthenticationFilter`, which validates a token, loads the corresponding `User` from MongoDB, and places that user in the SecurityContext for controllers to use.
>
> MongoDB stores four main document types: `User`, `Match`, `Message`, and `Expense`. The match document stores two user IDs in sorted order, two like flags, a status, and timestamps. A compound unique index prevents duplicate records for the same ordered pair.
>
> Matching is split into a separate Python service because the chosen ML ecosystem is Python-based. When `/api/auth/candidates` is called, Spring Boot finds other verified users, collects their lifestyle text, and calls FastAPI's `/api/similarity` endpoint. FastAPI encodes the anchor text and all candidate texts using `all-MiniLM-L6-v2`, calculates cosine similarity, and scales the result into a 55–98 user-experience range. If FastAPI cannot be reached, Java computes Jaccard word overlap so the product still returns candidates. This is graceful degradation, but the fallback is not semantically equivalent to the embedding model.
>
> A user can chat before mutual matching using an anonymous alias. When both users like each other, the match status becomes `matched`; `/api/auth/matches` then returns real name and email details. The project is a working prototype rather than a production-hardened system. Important next improvements would include secure HttpOnly cookies, real OAuth token verification, webhook signatures, stricter authorization, service timeouts, vector search, precomputed embeddings, WebSockets, validation, and integration tests.

## Natural answer to “Why did you build this?”

The repository supports this honest answer:

> I wanted to explore a roommate-matching problem where simple filters are not enough. Lifestyle compatibility is often expressed in natural language, so I used sentence embeddings to compare the meaning of users' descriptions. I also wanted the interaction to be more privacy-conscious, so profiles use anonymous IDs while people are getting to know each other. The project gave me practice with a full-stack architecture, authentication, MongoDB, a separate ML service, OCR, webhooks, and failure fallback.

The exact personal motivation is not documented in the code, so any more specific origin story would be an inference.

---

# 3. Complete technology reference

| Technology/library | Where used | Why it is used here | Interview knowledge |
|---|---|---|---|
| Java 17 | `backend/pom.xml` and all backend source | Main backend language | Strongly typed server-side language; the app runs on the Java 17 runtime |
| Spring Boot 3.3.2 | `backend/pom.xml`, `BackendApplication.java` | Starts the backend and provides web, security, and Mongo integrations | Convention-based Java application framework with dependency injection and embedded server |
| Spring Web | Controllers | REST endpoints using annotations such as `@GetMapping` and `@PostMapping` | Maps HTTP requests to controller methods |
| Spring Security | `SecurityConfig`, JWT filter | Route protection, password encoder, security filter chain | Authentication identifies a user; authorization decides what the user may access |
| JJWT 0.11.5 | `JwtTokenProvider` | Creates and validates signed JWTs | The token is signed with a secret and contains user identity/expiry claims |
| BCrypt | `SecurityConfig`, `AuthController` | Password hashing and comparison | Passwords are not stored in plaintext; `matches` checks a submitted password against the hash |
| Lombok | Models and DTOs | Generates getters, setters, constructors, builders, and `equals`/`hashCode` through annotations | Reduces boilerplate; generated code is not visible directly in source |
| MongoDB | `spring.data.mongodb.uri`, model annotations | Stores flexible user/match/message/expense documents | NoSQL document database; relationships are represented by IDs rather than relational foreign keys |
| Spring Data MongoDB | Repository interfaces | Provides CRUD and derived/custom queries | `MongoRepository` supplies persistence operations; `@Query` defines Mongo query JSON |
| React 18 | `frontend/src` | Builds the interactive SPA | UI is composed of components and re-rendered from state/props |
| TypeScript | `.ts` and `.tsx` files | Static typing for frontend code | Helps describe response shapes and catch some errors before runtime |
| Vite 5 | `frontend/package.json`, `vite.config.ts` | Dev server and production bundler | Fast client-side build tooling |
| React Router DOM | `App.tsx` | Client-side routes | Browser route changes without full page reloads |
| Tailwind CSS | JSX classes, `tailwind.config.ts` | Utility-based styling | Styles are composed from small utility classes |
| shadcn-style UI/Radix | `frontend/src/components/ui` | Reusable accessible UI primitives | These components are local source files, not a backend dependency |
| Lucide React | frontend components | Icons | Presentation only |
| `fetch` | frontend API calls | Browser HTTP client | Sends JSON requests and reads JSON responses |
| React hooks | pages/components | Local state and lifecycle side effects | `useState`, `useEffect`, `useRef`, and router hooks drive the screens |
| localStorage | auth and user data | Persists token/basic user across reloads | Convenient but exposes tokens to JavaScript/XSS; not a secure cookie alternative |
| Match status API | `GET /api/auth/matches` | Loads confirmed roommate matches from persisted backend state | The frontend renders match state returned by the backend rather than storing a local match flag |
| Python 3.9 | `ai_service/Dockerfile` | ML service runtime | Separate runtime from Java backend |
| FastAPI | `ai_service/main.py` | HTTP API around model inference | Pydantic request models validate the input shape |
| Uvicorn | AI Dockerfile and `main.py` | ASGI server for FastAPI | Runs the Python web application |
| Sentence Transformers | `ai_service/main.py` | Text-to-vector semantic encoding | Produces embeddings for sentence similarity |
| `all-MiniLM-L6-v2` | AI service | Chosen embedding model | Produces 384-dimensional sentence embeddings; the dimension comes from the model |
| PyTorch | indirect Sentence Transformers dependency | Runs the neural model | Not explicitly listed in `requirements.txt`, but used through the ML stack |
| Tesseract.js | `Signup.tsx` | Browser OCR | Extracts text from the uploaded document image |
| Verhoeff algorithm | `Signup.tsx` | Checksum validation of a 12-digit number | Detects many transcription errors; does not prove document authenticity |
| Browser SpeechRecognition | `VoiceMatchSection.tsx` | Native voice-to-text alternative | Browser support varies; transcript is stored as `vibeText` |
| OmniDimension | `omniWidget.tsx`, `VoiceMatchSection.tsx`, `WebhookController` | External guided voice onboarding | Widget runs in browser; callback can update the profile through the webhook |
| Docker | `backend/Dockerfile`, `ai_service/Dockerfile` | Reproducible service packaging | Backend uses multi-stage Maven/JRE build; AI image pre-downloads model weights |
| Vercel | `frontend/vercel.json`, README | Frontend hosting | Rewrite sends SPA routes to `index.html` |
| Render | README and dynamic `PORT` configuration | Intended backend/AI deployment platform | Containers bind to the platform-provided port |
| Maven | `backend/pom.xml`, Dockerfile | Java dependency/build tool | Packages the Spring Boot JAR |
| npm | `frontend/package.json`, lockfile | Frontend package/build tool | Installs and builds the Vite app |
| Git/GitHub | README author/project links only | Repository provenance is identifiable | No CI workflow was found; do not claim automated CI/CD |

## Technologies not found as implementations

- WebSocket/STOMP: not implemented.
- WebRTC: not implemented.
- Redis: not present.
- SQL/JPA/Hibernate: not present.
- Stripe/Razorpay/PayPal: not present.
- Vector database: not present.
- Backend file storage: not present.
- Server-side Google OAuth: not present.
- Automated tests: no test files found.

---

# 4. Repository structure

```text
InTune/
├── README.md
├── ai_service/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/intune/backend/
│       │   ├── BackendApplication.java
│       │   ├── config/DatabaseSeeder.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── ChatController.java
│       │   │   ├── ExpenseController.java
│       │   │   └── WebhookController.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Match.java
│       │   │   ├── Message.java
│       │   │   └── Expense.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── MatchRepository.java
│       │   │   ├── MessageRepository.java
│       │   │   └── ExpenseRepository.java
│       │   └── security/
│       │       ├── JwtAuthenticationFilter.java
│       │       ├── JwtTokenProvider.java
│       │       └── SecurityConfig.java
│       └── resources/application.properties
├── frontend/
│   ├── package.json
│   ├── vercel.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/api.ts
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── assets/
│   └── public/
└── .git/ and IDE/tooling metadata
```

## Backend folder relationships

```text
HTTP request
  → Security filter (if present)
  → controller method
  → repository interface
  → MongoDB
  → ResponseEntity / JSON response
```

There is no `service` package. `AuthController` contains both HTTP handling and substantial business logic, including matching and fallback similarity. This is important: do not describe the repository as having a classic controller-service-repository layering unless you explain that the service layer is currently absent.

## Frontend folder relationships

- `App.tsx` defines routes.
- `pages` represent screens and often contain API calls and business/presentation logic.
- `components` contain reusable page sections.
- `components/ui` contains reusable UI primitives.
- `context/AuthContext.tsx` stores basic user state, but many pages independently read `localStorage` and call `fetch`.
- `lib/api.ts` provides a generic authenticated API helper, but many pages use direct `fetch` instead.
- `assets` contains visual images.

## Important frontend pages

| File | Responsibility |
|---|---|
| `App.tsx` | React Router route table and providers |
| `Signup.tsx` | Registration UI, Tesseract OCR, Verhoeff validation, registration request |
| `Login.tsx` | Email login and placeholder Google flow |
| `Dashboard.tsx` | Loads profile, matches, chat count, and feature-lock state |
| `Voice.tsx` | Wraps `VoiceMatchSection` |
| `VoiceMatchSection.tsx` | Browser voice input, OmniDimension interaction, profile update, survey completion handling |
| `MatchMeter.tsx` | Loads `/me` and `/candidates`, derives frontend category scores, displays match cards, sends likes |
| `Chatterbox.tsx` | Loads top four candidates, chat history, sends messages, polls every three seconds |
| `Splits.tsx` | Finds a roommate and calls expense endpoints; includes frontend payment/QR UI |
| `StyleMatch.tsx` | Room styling UI and match gating |
| `Gallery.tsx` | Room image gallery UI |
| `GuideBot.tsx` | Frontend rule/response-based guidance UI; no backend AI endpoint found |
| `HowItWorks.tsx`, `Features.tsx`, landing sections | Product explanation and marketing UI |

---

# 5. Architecture

## Simple explanation

The browser is the user-facing application. It calls the Spring Boot backend. The backend stores data in MongoDB and calls the Python service only when semantic matching is needed. The browser also loads OmniDimension directly for voice onboarding, while OmniDimension can call the backend webhook.

## Technical diagram

```text
                                  ┌──────────────────────┐
                                  │ User's browser       │
                                  │ React + TypeScript   │
                                  │ Vite/Tailwind/UI     │
                                  └─────────┬────────────┘
                                            │ REST + Bearer JWT
                                            ▼
                                  ┌──────────────────────┐
                                  │ Spring Boot API      │
                                  │ Controllers          │
                                  │ Security filter      │
                                  │ RestTemplate client  │
                                  └───────┬───────┬──────┘
                                          │       │ HTTP POST /similarity
                                          │       ▼
                                          │  ┌──────────────────────┐
                                          │  │ FastAPI AI service   │
                                          │  │ Sentence Transformer │
                                          │  │ cosine similarity    │
                                          │  └──────────────────────┘
                                          ▼
                                  ┌──────────────────────┐
                                  │ MongoDB              │
                                  │ users                │
                                  │ matches              │
                                  │ messages             │
                                  │ expenses             │
                                  └──────────────────────┘

 Browser ───── loads ────► OmniDimension widget
 Browser ◄── postMessage ── OmniDimension events
 OmniDimension ── webhook POST ──► Spring Boot /api/webhook/omnidim
```

## Architectural style

The project is a client/server REST application with a separate ML inference service. The FastAPI application qualifies as a small independently deployable microservice. The Spring Boot application is the main application backend, but it is not internally split into controller/service/domain layers.

## Request ownership

- Frontend owns presentation, browser-local OCR, browser speech capture, JWT storage, and UI state.
- Spring Boot owns authentication, application rules, persistence orchestration, likes, matches, messages, expenses, and webhook processing.
- MongoDB owns persistence.
- FastAPI owns embedding inference and cosine-similarity calculation.
- OmniDimension owns the external guided voice conversation.

---

# 6. Data model and database

## Database technology

MongoDB is configured through:

```properties
spring.data.mongodb.uri=${MONGO_URI:mongodb://localhost:27017/intuneDB}
```

Spring Data MongoDB maps Java objects to collections.

## Collections

### `users` — `User.java`

Fields:

| Field | Meaning | Notes |
|---|---|---|
| `id` | Mongo document ID | `@Id`, represented as String |
| `name` | Real user name | Signup frontend currently derives it from email prefix |
| `email` | Login email | Unique index |
| `phone` | Phone number | Application checks it, but model has no unique annotation |
| `password` | BCrypt hash | Sensitive; should not be returned to clients |
| `anonymousId` | Public alias | Unique index |
| `gender` | Gender from signup/OCR | Used by current frontend product rule |
| `isVerified` | Verification flag | Used to filter candidates |
| `maskedAadhaar` | Display-safe suffix representation | Example `XXXX XXXX 1234` |
| `aadhaarHash` | SHA-256 hash | Unique sparse index; used to prevent duplicate identity numbers |
| `vibeText` | Lifestyle description | Defaults to empty string |
| `avatarSeed` | Frontend avatar seed | Random short UUID substring or seeded value |
| `role` | Role string | Defaults to `USER`; seeder creates `ADMIN`, but no role-based authorization is implemented |
| `createdAt` | Creation timestamp | Used for “new match” flag |
| `updatedAt` | Last update timestamp | Updated on profile/webhook changes |

### `matches` — `Match.java`

| Field | Meaning |
|---|---|
| `id` | Mongo document ID |
| `userA` | First user ID in sorted order |
| `userB` | Second user ID in sorted order |
| `userALiked` | Whether userA liked userB |
| `userBLiked` | Whether userB liked userA |
| `status` | `pending` or `matched` |
| `matchScore` | Exists in model but is not populated by the current like flow |
| `createdAt`, `updatedAt` | timestamps |

The class has:

```java
@CompoundIndex(def = "{'userA': 1, 'userB': 1}", unique = true)
```

The controller sorts IDs alphabetically before querying/saving so the pair has a consistent order.

### `messages` — `Message.java`

| Field | Meaning |
|---|---|
| `id` | Mongo document ID |
| `sender` | Sender user ID |
| `receiver` | Receiver user ID |
| `content` | Message text |
| `timestamp` | Chat ordering timestamp |
| `createdAt`, `updatedAt` | timestamps |

The message stores real user IDs internally. The frontend decides whether to display an alias or real name based on match status.

### `expenses` — `Expense.java`

| Field | Meaning |
|---|---|
| `id` | Mongo document ID |
| `amount` | Numeric amount |
| `description` | Expense description |
| `paidBy` | User ID of payer |
| `splitWith` | Other user ID |
| `category` | Category, default `General` |
| `date` | Expense date |
| `createdAt`, `updatedAt` | timestamps |

## Relationship diagram

```text
User ───────< Match >────── User
  │                           │
  ├────────< Message >────────┤
  │                           │
  └────────< Expense >────────┘
```

These are application-level relationships represented by string IDs. There are no JPA foreign keys, ORM relationship annotations, cascades, lazy loading, or eager loading.

## Repository methods

### `UserRepository`

- `findByEmail`
- `findByPhone`
- `findByAnonymousId`
- `findByAadhaarHash`
- `findByIdNot`

### `MatchRepository`

- `findByUserAAndUserB`
- `findMatchesForUser`
- `findConfirmedMatchesForUser`

### `MessageRepository`

- `findChatHistory`: `$or` query for both directions between two users.
- `findAllBySenderOrReceiver`: used to count active chat partners.

### `ExpenseRepository`

- `findExpensesBetweenUsers`: `$or` query for expenses in either payer/split direction.

## Database consistency observations

Confirmed:

- Email, anonymous ID, and Aadhaar hash have unique indexes; Aadhaar hash is sparse.
- Match pairs use a unique compound index.
- Other relationships are managed manually by storing IDs.

Not implemented or not clearly identifiable:

- Explicit transactions.
- Optimistic locking.
- Database-level uniqueness on phone.
- Message indexes for sender/receiver.
- Pagination.
- Vector indexes.
- Cascade deletion.

## Database interview answer

> I used MongoDB because the application stores profile documents with flexible lifestyle text and several feature-specific document types. Relationships are represented with user IDs, such as `sender` and `receiver` in messages or `userA` and `userB` in matches. I added unique indexes for email, anonymous IDs, Aadhaar hashes, and ordered match pairs. The current prototype does not use transactions or pagination, so those would be areas I would improve for a larger system.

---

# 7. Complete API reference

The backend controllers use class-level `/api/auth` for most application routes. Security permits only `/`, registration, login, Google-login, and `/api/webhook/**` without a JWT.

| Method | Endpoint | Purpose | Request | Response | Auth | Controller |
|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | Create account | `RegisterRequest` JSON | Basic user data + JWT | Public | `AuthController.registerUser` |
| POST | `/api/auth/login` | Password login | email/password | Basic user data + JWT | Public | `AuthController.loginUser` |
| POST | `/api/auth/google-login` | Placeholder Google-shaped login | email/name/googleId | Basic user data + JWT | Public | `AuthController.googleLogin` |
| GET | `/api/auth/me` | Return authenticated user | none | `User` object | Required | `AuthController.getMe` |
| PUT | `/api/auth/profile` | Update lifestyle text | `{vibeText}` | Updated `User` object | Required | `AuthController.updateProfile` |
| GET | `/api/auth/candidates` | Calculate candidate scores | none | Sorted candidate response list | Required | `AuthController.getCandidates` |
| POST | `/api/auth/like` | Set a like/dislike flag | `{candidateId, like}` | status/isMatch | Required | `AuthController.likeCandidate` |
| GET | `/api/auth/matches` | Return confirmed matches | none | Other users + status | Required | `AuthController.getMatches` |
| POST | `/api/auth/chat` | Store a message | `{receiverId, content}` | Created message | Required | `ChatController.sendMessage` |
| GET | `/api/auth/chat/{recipientId}` | Get two-way history | path ID | Message list | Required | `ChatController.getChatHistory` |
| GET | `/api/auth/chats/count` | Count active partners | none | `{count}` | Required | `ChatController.getActiveChatsCount` |
| POST | `/api/auth/splits` | Add expense | amount/description/splitWith/category | Created expense | Required | `ExpenseController.addExpense` |
| GET | `/api/auth/splits?roommateId=...` | Get expenses between users | query parameter | Expense list | Required | `ExpenseController.getExpenses` |
| POST | `/api/webhook/omnidim` | Process voice callback | arbitrary map payload | success/skipped/error map | Public | `WebhookController.handleOmnidimWebhook` |
| GET | `/` | Health-like root permitted route | none | Depends on application root mapping | Public | No explicit controller mapping found |

## API details

### `POST /api/auth/register`

`AuthController.RegisterRequest` contains:

- `name`
- `email`
- `phone`
- `password`
- `gender`
- `isVerified`
- `maskedAadhaar`
- `aadhaarNumber`

The method checks name/email/password presence, duplicate email, duplicate phone through a repository lookup, and duplicate Aadhaar hash. It BCrypt-hashes the password, SHA-256-hashes the Aadhaar number, generates an alias and avatar seed, saves the `User`, creates a JWT, and returns a 201 response.

### `POST /api/auth/login`

Looks up the email and calls `passwordEncoder.matches`. Invalid credentials produce HTTP 401. Success returns a newly generated JWT.

### `POST /api/auth/google-login`

Looks up the submitted email. If it does not already exist, it returns a 400 message asking the user to sign up. If it exists, it creates a JWT. `googleId` is accepted in the DTO but is not used for verification.

### `GET /api/auth/me`

The JWT filter has already placed the complete `User` document into the SecurityContext. The controller casts the principal to `User` and returns it.

### `PUT /api/auth/profile`

Loads the authenticated user from MongoDB, updates `vibeText` when non-null, updates `updatedAt`, saves, and returns the user.

### `GET /api/auth/candidates`

This is the main matching API. It filters out the current user and keeps only verified candidates. It calls FastAPI with:

```json
{
  "anchor": "current user vibeText",
  "candidates": ["candidate text 1", "candidate text 2"]
}
```

If a valid `scores` array comes back, it is used. Otherwise, or if the request throws, Java runs `calculateFallbackSimilarity`. The candidates are then sorted in descending score order.

### `POST /api/auth/like`

The controller sorts the two IDs lexicographically so the same pair maps to one document. It sets the appropriate like flag. On an existing record, both true flags change the status to `matched`.

Potential edge case: the new-record branch initializes status to `pending` without an explicit immediate both-flags check.

### `GET /api/auth/matches`

Uses `findConfirmedMatchesForUser`, which only returns records with status `matched`. It finds the other user and returns real name, email, alias, avatar seed, and status. There is no distinct identity-reveal endpoint.

### Chat APIs

`sendMessage` validates receiver/content non-null and non-empty, creates a message with the authenticated sender ID, and saves it. `getChatHistory` uses a Mongo `$or` query for both directions and sorts by timestamp ascending in Java.

The controller does not visibly verify that the receiver exists or that the sender is authorized to chat with that receiver.

### Expense APIs

`addExpense` requires a positive amount, description, and `splitWith`. It uses the authenticated user as `paidBy`. `getExpenses` requires a roommate ID and retrieves expenses in either direction, sorting newest first.

### Webhook API

`handleOmnidimWebhook` receives an untyped `Map<String,Object>`, checks multiple possible payload locations, finds an email and lifestyle text, looks up the user, updates `vibeText`, and returns `success`, `skipped`, or `error`.

There is no visible webhook signature check, schema validation, replay protection, or idempotency key.

## HTTP concepts to know

- **GET:** retrieve data; used for `/me`, candidates, matches, chat history, chat count, and expenses.
- **POST:** create or trigger an operation; used for registration, login, likes, messages, expenses, and webhook callbacks.
- **PUT:** replace/update a known resource; used for profile lifestyle update.
- **PATCH:** not used in the repository.
- **DELETE:** not used in the repository.
- **Path variable:** `/chat/{recipientId}` embeds the recipient ID in the URL.
- **Query parameter:** `/splits?roommateId=...` sends a filter in the URL.
- **Request body:** JSON sent with registration, login, profile, chat, like, and expense requests.
- **Headers:** `Authorization: Bearer ...` carries the JWT; `Content-Type: application/json` describes JSON bodies.
- **Status codes:** registration uses 201 on success; login uses 401 on invalid credentials; validation errors commonly use 400; missing users can use 404; webhook exceptions use 500.

---

# 8. Authentication and security

## Simple explanation

Authentication asks: “Who are you?” Authorization asks: “Are you allowed to do this?”

InTune uses email/password login to establish identity, then a signed JWT to carry that identity on later API calls. Spring Security validates the token before protected controllers run.

## Registration flow

1. The browser validates the form, terms, document OCR, and Verhoeff checksum.
2. It sends registration JSON to `/api/auth/register`.
3. The backend checks duplicate email/phone/Aadhaar hash.
4. Password is encoded using BCrypt.
5. Aadhaar is hashed with SHA-256.
6. User is saved to MongoDB.
7. JWT is generated with the Mongo user ID as subject and `id` claim.
8. Token is returned to the browser.
9. Browser stores token and basic user object in `localStorage`.

## Login flow internally

1. Browser calls `POST /api/auth/login` with email/password.
2. `AuthController.loginUser` finds the user using `UserRepository.findByEmail`.
3. `BCryptPasswordEncoder.matches` compares the submitted password with the stored hash.
4. If invalid, the controller returns 401.
5. If valid, `JwtTokenProvider.generateToken(user.getId())` builds a signed JWT.
6. Claims include subject, user ID, issued-at time, and expiration.
7. Frontend stores the token.
8. Future API calls include `Authorization: Bearer <token>`.

## JWT validation on a protected request

1. Request enters Spring Security.
2. `JwtAuthenticationFilter`, a `OncePerRequestFilter`, reads the Authorization header.
3. It extracts the token after `Bearer `.
4. `JwtTokenProvider.validateToken` verifies signature and parses claims.
5. It extracts the user ID.
6. `UserRepository.findById` loads the current `User` document.
7. A `UsernamePasswordAuthenticationToken` is created with the full user as principal.
8. The principal is stored in `SecurityContextHolder`.
9. The controller can retrieve the user from the security context.

If validation fails, the filter catches the exception and continues without setting authentication. The protected route is then expected to be rejected by Spring Security.

## Security configuration

`SecurityConfig`:

- enables web security;
- provides `BCryptPasswordEncoder`;
- enables CORS;
- disables CSRF;
- uses `SessionCreationPolicy.STATELESS`;
- permits registration, login, placeholder Google-login, and all webhook routes;
- requires authentication for all other routes;
- inserts the JWT filter before `UsernamePasswordAuthenticationFilter`.

## Security limitations to state honestly

- JWT is stored in `localStorage`.
- Default JWT secret fallback exists: `super1223@`.
- No refresh-token flow is visible.
- No rate limiting is visible.
- CORS permits all origin patterns and credentials, which is unsafe for production.
- Webhook is publicly accessible without visible signature verification.
- `GET /me` returns the complete `User` object, potentially exposing password hash and Aadhaar hash.
- Google-login does not validate a Google-signed identity token.
- Controllers do not consistently enforce resource-level authorization.
- Raw Aadhaar number is sent in the registration request, even though only its hash is stored.

## Better production approach

Use short-lived access tokens in secure HttpOnly cookies, refresh-token rotation, strict CORS, a mandatory production secret, DTOs that exclude sensitive fields, OAuth ID-token validation, webhook signatures, rate limiting, and backend authorization checks for message/match resources.

---

# 9. AI/ML deep dive

## What AI functionality exists?

The confirmed AI functionality is semantic similarity matching through the Python service. The code does not contain a generative LLM, prompt construction, retrieval-augmented generation, vector database, model fine-tuning, or evaluation framework.

## What is an embedding?

An embedding is a list of numbers representing the meaning of text. Texts with related meanings tend to be closer in vector space.

For this project:

```text
Lifestyle sentence
  → all-MiniLM-L6-v2
  → 384-number vector
```

The individual 384 coordinates are not manually designed fields such as “cleanliness” or “sleep.” They are learned numerical features.

## FastAPI request model

```python
class SimilarityRequest(BaseModel):
    anchor: str
    candidates: List[str]
```

The anchor is the current user's text. Candidates are other users' texts.

## Model initialization

`main.py` loads the model at module startup:

```python
model = SentenceTransformer(model_name)
```

The Dockerfile pre-downloads the model while building the image so the container does not need to download it during normal startup.

## Similarity calculation

1. Encode the anchor into a tensor.
2. Encode candidate texts into tensors.
3. Call `util.cos_sim(anchor_embedding, candidate_embeddings)`.
4. Read one score per candidate.
5. Clip values to `[-1, 1]`.
6. Shift into `[0, 1]`.
7. Map into `[55, 98]`:

```python
shifted = (val + 1.0) / 2.0
ux_score = 55.0 + (shifted * 43.0)
```

8. Round to one decimal place.
9. Return `{ "scores": [...] }`.

## Why cosine similarity?

Cosine similarity compares the angle/direction between vectors. For embeddings, direction is often more useful than raw vector length when asking whether two texts have similar meaning.

The repository clearly implements cosine similarity. The original author's exact reason is not documented, but a reasonable interview explanation is:

> Since the model returns text embeddings, cosine similarity is a standard way to compare their semantic direction. It is simple, bounded, and works well for sentence-vector comparison.

## Empty input behavior

- Empty anchor: returns `50.0` for every candidate.
- Empty candidates: returns an empty score list.
- Model exception: returns HTTP 500 from FastAPI.

The Java backend may avoid calling FastAPI when the current user's vibe text is empty and uses its own fallback calculation instead.

## Jaccard fallback

`AuthController.calculateFallbackSimilarity`:

1. Returns `50.0` if either text is null/blank.
2. Lowercases and splits each text into a set of words.
3. Builds intersection and union.
4. Calculates:

```text
Jaccard = |intersection| / |union|
```

5. Maps it to:

```text
55 + Jaccard × 43
```

This fallback keeps the API available but loses semantic understanding. It is a graceful availability fallback, not a quality-equivalent algorithm.

## Frontend matching logic caveat

`MatchMeter.tsx` also contains a local `calculateCompatibility` function. It calculates:

- keyword-category scores for cleanliness, sleep, social habits, lifestyle, and food;
- a word-frequency cosine score for overall score.

The page first loads the backend's candidate `match_score`, then applies frontend compatibility logic to build/attach category scores. Therefore:

- the FastAPI service returns the backend overall score;
- the UI category breakdown is generated in the frontend;
- the category scores are not independently returned by FastAPI.

Do not say that the AI model outputs five category scores unless the code changes.

## AI limitations

- General-purpose model, not trained specifically on roommate compatibility.
- Similar meaning does not guarantee safe or practical compatibility.
- The 55–98 mapping is a UX scale, not calibrated probability.
- No evaluation dataset or accuracy metric is present.
- No user feedback loop is present.
- Candidate comparisons are brute force.
- Embeddings are recalculated for candidates on each request.
- Large candidate lists create larger network requests and inference time.
- No AI-service authentication is visible.
- No explicit timeout/circuit breaker is configured around `RestTemplate`.

## Strong interview answer

> I used Sentence Transformers because the input is free-form lifestyle text, where exact keyword overlap is not enough. The model converts each description into a vector and cosine similarity compares the vectors. I chose a lightweight pretrained model so I could self-host inference in Python without an external per-request API. The current score is an application compatibility score rather than a scientifically calibrated probability, and the system falls back to Jaccard overlap if the model service is unavailable. For scale, I would precompute embeddings and use a vector index to retrieve only the top candidates.

---

# 10. Voice and identity flow

## Native browser speech

`VoiceMatchSection.tsx` checks for:

```javascript
window.SpeechRecognition || window.webkitSpeechRecognition
```

It configures:

- continuous recognition;
- interim results;
- `en-IN` language;
- `onresult` to build a transcript;
- `onend` and `onerror` to stop recording state.

The user can save the transcript through `PUT /api/auth/profile`.

## OmniDimension widget

`omniWidget.tsx`:

1. Reads the local user object.
2. Sets `window.OmniDimension.variables.user_name`.
3. Appends the external script `https://omnidim.io/web_widget.js?...`.
4. Removes the script and injected widget nodes when unmounted.

`VoiceMatchSection.tsx` listens to `window.message` events. It treats event names containing `end`, `complete`, `hangup`, `disconnect`, or `close` as completion events. It tries to save `transcript`, `summary`, `text`, or `content` directly. If no text is present, it waits and checks the backend profile later.

## Webhook flow

`WebhookController.handleOmnidimWebhook` searches:

- `payload.call_report.extracted_variables.email_address`
- `payload.call_report.extracted_variables.email`
- lifestyle keys such as `lifestyle_preferences` and `special_requirements`
- `call_report` fallbacks such as `summary` and `transcript`
- root-level email keys
- root-level summary/transcript/text keys

If email and non-empty text are found, it lowercases the email, finds the user, writes `vibeText`, updates the timestamp, and saves.

## Identity OCR flow

`Signup.tsx` creates a Tesseract worker with English language data, recognizes the uploaded file, and searches OCR output for:

- `4 4 4` digit groups;
- contiguous 12-digit sequences.

It detects gender by searching uppercase OCR text for `FEMALE` or `MALE`. It first checks `FEMALE`, so the substring in `FEMALE` does not accidentally match `MALE` first.

The number is accepted only if it has 12 digits and the Verhoeff accumulator ends at zero. The frontend sends the raw number to registration; the backend hashes it with SHA-256 and stores the hash.

## Correct interview wording

> The document image is OCR-processed in the browser, which avoids sending the image itself to the backend. The extracted number is still included in the signup request, hashed server-side, and used for duplicate prevention. The Verhoeff check detects number-entry errors; it is not a government-backed authenticity check.

---

# 11. Complete major user flows

## Registration flow

```text
User uploads document
  → Signup.tsx
  → Tesseract.js OCR in browser
  → Verhoeff validation
  → frontend restriction for detected Male
  → POST /api/auth/register
  → AuthController.registerUser
  → duplicate lookups
  → BCrypt password hash
  → SHA-256 Aadhaar hash
  → UserRepository.save
  → MongoDB users
  → JwtTokenProvider.generateToken
  → token + basic user JSON
  → localStorage
  → /dashboard
```

## Login flow

```text
Login.tsx
  → POST /api/auth/login
  → UserRepository.findByEmail
  → BCrypt.matches
  → JWT generation
  → browser stores token/user
  → Dashboard
```

## Profile/lifestyle flow

```text
VoiceMatchSection
  → speech transcript or OmniDimension summary
  → PUT /api/auth/profile
  → JWT filter identifies principal
  → AuthController.updateProfile
  → UserRepository.findById/save
  → MongoDB user.vibeText
  → updated User response
  → frontend stores profile and navigates to matches
```

### Profile endpoint contract

Profile reads use `GET /api/auth/me`, while profile updates use `PUT /api/auth/profile`. The frontend and backend now follow this same contract.

## Candidate matching flow

```text
MatchMeter.tsx
  → GET /api/auth/me
  → GET /api/auth/candidates
  → JwtAuthenticationFilter
  → AuthController.getCandidates
  → UserRepository.findByIdNot
  → filter verified users
  → collect vibeText
  → RestTemplate POST to FastAPI /api/similarity
  → model.encode(anchor/candidates)
  → util.cos_sim
  → score scaling
  → scores returned
  → Java builds CandidateResponse objects
  → descending sort
  → frontend adds category UI scores
  → MatchCard display
```

## Anonymous chat flow

```text
User selects candidate
  → Chatterbox navigates to /chat?recipient=id
  → GET /api/auth/me
  → GET /api/auth/candidates, takes top four
  → GET /api/auth/matches for confirmed identity state
  → GET /api/auth/chat/{recipientId}
  → MessageRepository.findChatHistory
  → messages sorted by timestamp
  → UI displays alias unless matched
```

Sending:

```text
Chat form
  → POST /api/auth/chat
  → ChatController.sendMessage
  → MessageRepository.save
  → created message response
  → append to local message state
```

The page sets a three-second interval to refetch chat data. This is polling, not real-time push.

## Mutual-match flow

```text
User A clicks Swipe Right
  → POST /api/auth/like
  → Match.userALiked or userBLiked updated
  → MatchRepository.save

User B clicks Swipe Right
  → second like flag updated
  → if both true: status = matched
  → GET /api/auth/matches
  → confirmed match returned with real name/email
```

The frontend opens a congratulations modal immediately when the user clicks like, even before the backend proves that both users liked each other. The backend response still distinguishes `pending` from `matched`.

## Expense flow

```text
Splits.tsx
  → GET /api/auth/matches
  → choose first confirmed match
  → GET /api/auth/splits?roommateId=id
  → ExpenseRepository.findExpensesBetweenUsers
  → render ledger

Add expense
  → POST /api/auth/splits
  → validate amount/description/splitWith
  → paidBy = authenticated user
  → ExpenseRepository.save
  → created expense response
```

## What “payment” actually means here

`PaymentSection.tsx` handles QR-code uploads, saved local browser data, opening a payment app/link, and UI notifications. There is no backend payment transaction or provider integration. Do not describe this as implemented online payment processing.

---

# 12. File-by-file deep explanation

## `README.md`

### Purpose

Documents the product story, architecture diagram, setup, technology stack, roadmap, and deployment claims.

### Important connection

It is useful context, but source code is authoritative when the two differ. For example, README language suggests fully functional identity verification and core flows, while the repository reveals limitations such as placeholder Google login, frontend mock match state, and the `/profile` GET mismatch.

### Interview questions

- Which README claims are actually implemented?
- What is the difference between a product description and the current code?
- What roadmap item would you implement next?

## `backend/src/main/java/com/intune/backend/BackendApplication.java`

### Purpose

Spring Boot application entry point. It starts the backend through `SpringApplication.run`.

### Concept

The `main` method is the process entry point. Spring scans components such as controllers, repositories, configuration, and filters and creates them as managed beans.

## `backend/src/main/resources/application.properties`

### Purpose

Externalized runtime configuration.

Important properties:

```properties
server.port=${PORT:5001}
spring.data.mongodb.uri=${MONGO_URI:mongodb://localhost:27017/intuneDB}
jwt.secret=${JWT_SECRET:super1223@}
jwt.expiration=604800000
ai.similarity.url=${AI_SIMILARITY_URL:http://localhost:8000/api/similarity}
```

### Interview point

Environment variables allow the same application image to run locally and in deployment. The secret fallback is convenient locally but unsafe in production.

## `DatabaseSeeder.java`

### Purpose

Implements `CommandLineRunner` and seeds users when the database has fewer than five users.

It creates:

- admin-like user `Suhani Gupta` with role `ADMIN`;
- three verified candidate users;
- passwords encoded with the same `PasswordEncoder`.

### Important limitation

The condition is based on total count, and seeded credentials are hard-coded (`Password123`). This is suitable for demo data but not production initialization.

## `AuthController.java`

### Purpose

Central controller for authentication, profiles, candidate matching, likes, and confirmed matches.

### Important DTOs

- `RegisterRequest`: registration payload.
- `LoginRequest`: email/password.
- `GoogleLoginRequest`: email/name/googleId placeholder payload.
- `ProfileRequest`: `vibeText` update.
- `LikeRequest`: `candidateId` and `like` boolean.
- `CandidateResponse`: safe-ish candidate display shape, including score and alias.

### Important methods

- `generateAnon`: random adjective + number alias.
- `hashAadhaar`: SHA-256 hex encoding.
- `registerUser`: validates, hashes, saves, issues JWT.
- `loginUser`: finds user, compares password, issues JWT.
- `googleLogin`: checks email existence and issues JWT; does not verify Google.
- `getMe`: returns SecurityContext principal.
- `updateProfile`: writes `vibeText`.
- `getCandidates`: coordinates MongoDB, FastAPI, fallback scoring, sorting, and response creation.
- `likeCandidate`: upserts pair state and detects mutual matching.
- `getMatches`: returns confirmed matches with real user details.
- `calculateFallbackSimilarity`: local Jaccard implementation.

### Architectural observation

The controller is doing controller work, persistence orchestration, external service invocation, score fallback, and match business logic. A future refactor could move these concerns into services.

## `ChatController.java`

### Purpose

Stores messages, retrieves two-way history, and counts active chat partners.

### Important behavior

It obtains the sender from the SecurityContext rather than trusting a sender ID supplied by the client.

### Limitation

It does not visibly validate recipient existence or chat permission.

## `ExpenseController.java`

### Purpose

Adds and retrieves expenses between authenticated users.

### Important behavior

`paidBy` always comes from the authenticated principal. That prevents the client from choosing an arbitrary payer for a new record.

### Limitation

It does not visibly verify that `splitWith` is a confirmed roommate or that the category/amount has more detailed validation.

## `WebhookController.java`

### Purpose

Adapts OmniDimension callback payloads into a profile update.

### Important behavior

It searches multiple nested/root keys to tolerate payload shape variation and returns a non-error `skipped` result if required data is missing.

### Security limitation

It logs the full payload with `System.out.println`, is publicly permitted, and has no visible webhook signature verification. Payloads could include sensitive voice/profile data.

## Model files

### `User.java`

MongoDB document with unique indexes, profile fields, verification fields, role, lifestyle text, and timestamps.

### `Match.java`

Ordered pair document with two directional like flags and status. `matchScore` exists but is not used by the current like path.

### `Message.java`

Simple sender/receiver/content document with timestamps.

### `Expense.java`

Simple expense ledger document connecting two user IDs.

## Repository files

Repositories extend `MongoRepository`, which gives CRUD methods. `@Query` methods provide two-direction queries. The repository layer contains data access but no service abstraction.

## Security files

### `JwtTokenProvider.java`

Creates and validates HS256 JWTs. It pads a short configured secret to at least 32 bytes before creating the signing key. Padding a weak secret does not make the original secret cryptographically strong; production should require a random secret of adequate length.

### `JwtAuthenticationFilter.java`

Runs once per request, extracts/validates token, loads `User`, and creates the authentication principal. It suppresses authentication exceptions rather than returning a detailed error.

### `SecurityConfig.java`

Defines BCrypt, stateless security, route permissions, CORS, CSRF disabled, and filter order.

## `ai_service/main.py`

### Purpose

Minimal model-serving API.

### Important code

- `FastAPI(title=...)`: creates app.
- CORS middleware: currently allows all origins.
- model loading: happens at module import/startup.
- `SimilarityRequest`: validates anchor/candidates shape.
- `read_root`: returns health/model information.
- `calculate_similarity`: handles empty input, encodes text, calculates cosine similarity, maps scores, and catches model errors.

## `frontend/src/lib/api.ts`

### Purpose

Generic API helper that reads the token from `localStorage`, sends JSON headers, attaches Bearer JWT, parses JSON, and throws with `data.msg` on non-2xx responses.

### Limitation

Many pages bypass this helper and use direct `fetch`, so request/error behavior is duplicated.

## `frontend/src/context/AuthContext.tsx`

### Purpose

Stores basic user state and provides `logout`.

### Limitation

It does not validate the JWT or fetch the current user on startup. Pages independently use `localStorage`.

## `frontend/src/pages/Signup.tsx`

### Purpose

Signup UI plus OCR/checksum logic.

### Important methods

- `validateAadhaar`: length, numeric, and Verhoeff check.
- `processAadhaar`: OCR, gender extraction, number extraction, masked/raw output.
- `handleSignup`: form checks, OCR, gender restriction, registration request, token persistence.
- `handleGoogleSignup`: placeholder random Google-like account creation attempt.

## `frontend/src/pages/Login.tsx`

### Purpose

Email/password login and browser-local account chooser UI for the placeholder Google flow.

### Important limitation

The comments mention an Express endpoint, but the actual backend is Spring Boot. Comments are stale; actual `fetch` URLs determine behavior.

## `frontend/src/components/VoiceMatchSection.tsx`

### Purpose

Owns voice survey UI, native speech recognition, OmniDimension event handling, profile updates, and navigation to matches.

### Profile endpoint usage

Profile reads use `GET /api/auth/me`; profile updates use `PUT /api/auth/profile`.

## `frontend/src/pages/MatchMeter.tsx`

### Purpose

Loads current user/candidates, displays score analytics/cards, navigates to anonymous chat, and sends likes.

### Important logic

The local `calculateCompatibility` function creates category keyword scores and a word-frequency cosine score. The backend already calculated its own score, so there are two layers of matching-related presentation logic.

### UI behavior

Clicking like immediately opens a match reveal modal before confirmation is known. It still sends the like request to the backend.

## `frontend/src/pages/Chatterbox.tsx`

### Purpose

Chat workspace with top-four candidate list, alias/name display, history loading, sending, and polling.

### Important behavior

`setInterval(fetchChatData, 3000)` is the current real-time substitute.

## `frontend/src/pages/Splits.tsx`

### Purpose

Calls expense APIs and displays the expense ledger. It also contains frontend-only payment/QR interactions.

## `frontend/src/components/PaymentSection.tsx`

### Purpose

UI for storing/displaying QR images and opening a payment app or link.

### Important boundary

No backend payment processing is implemented.

---

# 13. Important classes and methods

| Symbol | File | Responsibility | Interview angle |
|---|---|---|---|
| `BackendApplication.main` | backend app | Starts Spring Boot | Application bootstrap and component scanning |
| `AuthController.registerUser` | AuthController | Creates account | Validation, password/Aadhaar hashing, persistence, JWT |
| `AuthController.loginUser` | AuthController | Password login | BCrypt and token issue |
| `AuthController.getCandidates` | AuthController | Matching orchestration | Mongo query, FastAPI call, fallback, sorting |
| `AuthController.likeCandidate` | AuthController | Match state update | Ordered pair, directional flags, mutual status |
| `AuthController.calculateFallbackSimilarity` | AuthController | Jaccard fallback | Availability versus semantic quality |
| `JwtTokenProvider.generateToken` | security | Signs JWT | Claims, expiry, HS256 |
| `JwtTokenProvider.validateToken` | security | Verifies JWT | Signature and expiry parsing |
| `JwtAuthenticationFilter.doFilterInternal` | security | Converts JWT into authenticated principal | Filter chain and SecurityContext |
| `SecurityConfig.securityFilterChain` | security | Defines public/protected routes | Stateless auth, CORS, CSRF, filter order |
| `WebhookController.handleOmnidimWebhook` | controller | Converts external callback to profile update | Untyped payload adaptation and webhook security |
| `ChatController.sendMessage` | controller | Saves message | Authenticated sender and input validation |
| `MessageRepository.findChatHistory` | repository | Two-way chat query | Mongo `$or` query |
| `ExpenseController.addExpense` | controller | Saves expense | Authenticated payer |
| `DatabaseSeeder.run` | config | Inserts demo users | Startup behavior and hard-coded credentials |
| `main` in AI service | Python | Starts Uvicorn | Dynamic port |
| `calculate_similarity` | Python | Encodes and compares text | embeddings, cosine similarity, score mapping |
| `Signup.processAadhaar` | frontend | OCR and extraction | Client-side processing and privacy boundary |
| `Signup.validateAadhaar` | frontend | Verhoeff checksum | Validation versus authenticity |
| `VoiceMatchSection.saveVibeProfile` | frontend | Stores manual/native transcript | REST update flow |
| `MatchMeter.calculateCompatibility` | frontend | Category/keyword presentation scores | Difference between UI score and backend SBERT score |
| `Chatterbox.fetchChatData` | frontend | Loads candidates/matches/history | Polling and alias display |

---

# 14. Error handling

## Confirmed mechanisms

- Signup frontend checks password confirmation, agreements, missing document, OCR failure, gender, and checksum.
- Backend registration returns 400 for missing basic fields and duplicate checks.
- Login returns 401 for invalid credentials.
- Profile update returns 404 if the authenticated user cannot be found.
- Chat validates missing recipient/content.
- Expense API validates positive amount, description, roommate ID.
- FastAPI returns 500 when model inference throws.
- Backend catches FastAPI call exceptions and uses Jaccard fallback.
- Webhook returns `skipped` for missing data/user and 500 for unexpected exceptions.
- Frontend displays toast errors in several pages.

## Missing or weak mechanisms

- No global Spring exception handler was found.
- No consistent error DTO format exists.
- No explicit RestTemplate timeout/circuit breaker is visible.
- Some frontend fetch calls log or silently ignore errors.
- No rate limiting is visible.
- No retry strategy is visible for webhook or database operations.
- No test suite verifies error paths.

---

# 15. Design decisions and interview answers

## Why React?

### Fact

The frontend is a React SPA with many interactive pages/components.

### Reasonable answer

> React fits the application because the UI has many stateful interactions: forms, dialogs, match cards, chat updates, loading states, and conditional identity display. Component reuse is useful for shared elements such as buttons, cards, navigation, and match cards.

### Tradeoff

React is flexible, but state and API logic can become scattered, which is visible because many pages directly use `fetch`.

## Why Spring Boot?

### Fact

The backend uses Spring Web, Spring Security, Spring Data MongoDB, and Java 17.

### Reasonable answer

> Spring Boot gives the project a structured Java REST backend, dependency injection, mature security support, and direct MongoDB integration. It also gives a clean way to insert a JWT filter into the request pipeline.

### Tradeoff

It is more heavyweight than a small Flask/Express service and the current code would benefit from moving business logic out of controllers.

## Why MongoDB?

### Reasonable answer

> The data is document-shaped and includes flexible profile/lifestyle fields. MongoDB made it straightforward to store users, matches, messages, and expenses while the prototype evolved. The tradeoff is that relationships and consistency must be managed manually through IDs and application logic.

## Why JWT?

### Reasonable answer

> The frontend and backend are separately deployed, and JWT provides stateless request authentication. The backend can validate the signed token and load the user without maintaining an in-memory session. For production I would reconsider localStorage and use secure HttpOnly cookies.

## Why FastAPI?

### Fact

The AI model runs in a Python FastAPI process.

### Reasonable answer

> FastAPI provides a small typed HTTP wrapper around Python ML libraries. It keeps Sentence Transformers and PyTorch dependencies out of the Java application and allows the inference service to be deployed independently.

## Why separate AI service?

### Reasonable answer

> The main application is Java, while the model ecosystem used here is Python-native. Separating inference keeps responsibilities and dependencies clearer and allows independent scaling. The tradeoff is network latency, deployment complexity, and another failure boundary.

## Why semantic embeddings?

> Lifestyle information is free-form text. Embeddings capture related meaning even when two users do not use exactly the same words. The limitation is that semantic similarity alone is not a complete roommate compatibility model.

## Why cosine similarity?

> Embeddings are vectors, and cosine similarity is a standard way to compare the direction of two vectors. It is simple, bounded, and works well for sentence similarity.

## Why a Jaccard fallback?

> The fallback keeps candidate discovery available if FastAPI is temporarily unavailable. It is easy to compute locally and has no model dependency. It is less accurate semantically, so it should be treated as graceful degradation rather than an equivalent replacement.

## Why anonymous IDs?

> Anonymous IDs reduce early identity exposure while users are deciding whether to continue a conversation. The tradeoff is that the backend still stores real IDs internally and must enforce strict authorization to preserve privacy.

## Why polling instead of WebSockets?

### Fact

The frontend polls chat every three seconds, and the README lists WebSockets as future work.

### Reasonable answer

> Polling was simpler for the prototype because the existing REST API could be reused for history retrieval. The drawback is unnecessary repeated requests and delayed delivery. A production chat experience would use WebSockets or a managed real-time service.

## Why browser OCR?

> It avoids uploading the document image itself to the backend. The limitation is that browser OCR quality varies, and the extracted number still travels to the backend for hashing.

## Match-state source of truth

The backend is the source of truth for confirmed roommate matches. The authenticated frontend calls `GET /api/auth/matches`, which uses `MatchRepository.findConfirmedMatchesForUser(...)` and returns only persisted confirmed matches. The frontend no longer uses a client-controlled match flag to unlock dashboard features.

---

# 16. Challenges evidenced or reasonably inferred

The repository does not contain a development journal, so personal statements such as “I spent three days debugging X” would be fabricated. The following are technically defensible challenges based on the implementation.

## Challenge: integrating a Python model with a Java backend

**Evidence:** `AuthController` uses `RestTemplate` and `ai.similarity.url`; `ai_service/main.py` exposes `/api/similarity`.

**How it is handled:** JSON request/response over HTTP; Java fallback if the call fails.

**Interview framing:**

> The main integration challenge was crossing the Java/Python boundary cleanly. I kept the contract small: an anchor string and candidate string list in, a score array out. I also added a Java fallback so matching did not completely fail when the model service was unavailable.

## Challenge: turning identity OCR into signup data

**Evidence:** `processAadhaar`, regex extraction, Verhoeff, masked/raw values.

**Interview framing:**

> OCR text is noisy, so the code searches multiple number formats and validates candidates with a checksum. I had to distinguish number-format validation from actual identity authenticity; the current implementation only performs the former.

## Challenge: preserving one match record for two users

**Evidence:** lexicographic ordering and compound unique index.

**Interview framing:**

> Since a match is a relationship between two users, I normalized the pair by sorting the IDs before lookup and save. That gives one consistent document instead of separate A-B and B-A documents.

## Challenge: asynchronous external voice completion

**Evidence:** `postMessage` listener, webhook, delayed profile checks.

**Interview framing:**

> The voice widget may finish before the final summary is available, so the frontend handles direct event text and also waits for a webhook-backed profile update. This is an eventual-consistency flow rather than a single synchronous request.

## Challenge: graceful AI-service failure

**Evidence:** exception catch around `RestTemplate`, local Jaccard fallback.

**Interview framing:**

> A dependent service can fail independently, so I allowed the main application to degrade to a simpler local similarity calculation. The next step would be explicit timeouts, circuit breaking, and monitoring.

---

# 17. Scalability and performance

## Current complexity

### Candidate retrieval

`UserRepository.findByIdNot(currentUser.getId())` loads all other users and then filters verified users in Java. If there are `N` users, candidate materialization is approximately `O(N)`.

### AI comparison

The AI service encodes one anchor and all candidates. If there are `N` candidates, inference work and the request payload grow with `N`.

### Jaccard fallback

For two texts with word sets of sizes `A` and `B`, set construction and intersection/union are approximately `O(A + B)` per candidate. Across all candidates, it is approximately linear in total text size.

### Chat history

The repository query returns all messages between two users, then sorts in Java. Long conversations increase transfer and memory usage.

### Active chat count

`findAllBySenderOrReceiver` loads all messages involving the user, then builds a set of partner IDs. This can become expensive for users with large history.

## At 10 users

The current design is adequate for a demo. Brute-force candidate comparison and polling are inexpensive.

## At 1,000 users

The candidate endpoint starts producing larger database results and AI requests. Pre-filtering, pagination, timeouts, and embedding caching become important.

## At 100,000+ users

The current approach is not appropriate. Sending every candidate's text to FastAPI for every request is too expensive. Use precomputed embeddings, vector search/top-k retrieval, pagination, background jobs, and independently scaled inference workers.

## At 1 million users

The system would need a serious distributed design:

- vector index/search infrastructure;
- sharded/replicated database strategy;
- queues for profile embedding updates;
- caching/rate limiting;
- WebSocket gateway or managed chat infrastructure;
- observability and service-level objectives;
- secure secrets and identity provider integration.

## Improvements by category

### Database

- Query verified candidates in MongoDB rather than load all then filter.
- Add message sender/receiver indexes.
- Add pagination.
- Consider compound indexes matching common queries.
- Use atomic updates for likes.

### AI

- Precompute an embedding when `vibeText` changes.
- Store embeddings or send them to a vector index.
- Retrieve only top-k candidates.
- Batch model inference.
- Add model metrics and latency monitoring.

### Backend

- Add service classes.
- Configure RestTemplate timeout.
- Add circuit breaker and limited retry.
- Return DTOs instead of full database documents.
- Add validation annotations and consistent error responses.

### Chat

- WebSockets or managed real-time delivery.
- Paginated history.
- Message authorization and rate limiting.

### Frontend

- Centralize API client and authentication state.
- Stop using mock session state as a source of truth.
- Avoid duplicate candidate fetches in dashboard/chat/match pages.

---

# 18. Testing status

## Confirmed

`spring-boot-starter-test` exists as a Maven test dependency.

## Not found

No Java test classes, frontend test files, AI service tests, API contract tests, or CI test workflow were found in the repository.

## Tests that should be added

### Backend unit tests

- registration validation;
- duplicate email/phone/Aadhaar handling;
- BCrypt password comparison;
- JWT generation/validation;
- Jaccard edge cases;
- like state transitions;
- mutual match behavior;
- expense validation;
- webhook payload variants.

### Integration tests

- protected endpoint without token;
- expired/invalid JWT;
- Mongo repository queries;
- full register/login/profile/match flow;
- FastAPI success and fallback behavior.

### Frontend tests

- signup form validation;
- OCR extraction helpers;
- Verhoeff examples;
- login token persistence;
- candidate rendering;
- anonymous versus matched name display;
- polling cleanup;
- API error toast behavior.

### Contract tests

The Spring-to-FastAPI request and response contract should be tested to ensure score ordering matches candidate ordering.

---

# 19. Deployment and runtime

## Frontend

Vercel deployment is suggested by `frontend/vercel.json`. The rewrite:

```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

allows React Router paths to resolve to the SPA entry point.

## Backend Dockerfile

The backend uses a multi-stage build:

1. Maven + Java 17 builder downloads dependencies and packages the JAR.
2. Java 17 JRE Alpine image runs the JAR.
3. Render's `PORT` is passed to Spring Boot.

## AI Dockerfile

The AI service:

1. starts from Python 3.9 slim;
2. installs build dependencies;
3. installs `requirements.txt`;
4. pre-downloads `all-MiniLM-L6-v2` during image build;
5. runs Uvicorn on the dynamic port.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | backend/AI | Runtime listening port |
| `MONGO_URI` | backend | MongoDB connection |
| `JWT_SECRET` | backend | JWT signing secret |
| `AI_SIMILARITY_URL` | backend | FastAPI endpoint URL |
| `VITE_API_BASE_URL` | frontend | Backend API base URL |

## What is not identifiable

- No CI/CD workflow.
- No infrastructure-as-code.
- No production MongoDB configuration.
- No monitoring/alerting configuration.
- No secret manager configuration.
- No deployment manifest beyond Dockerfiles/Vercel rewrite.

---

# 20. Limitations and future improvements

## Short term

- Keep frontend profile reads on `GET /auth/me` and profile updates on `PUT /auth/profile`.
- Never return full `User` documents; use safe response DTOs.
- Remove or protect default JWT secret.
- Restrict CORS.
- Add webhook signature verification.
- Validate receiver/match permissions before chat.
- Add server-side email/phone/password validation.
- Add tests for matching and mutual likes.
- Handle alias collision retry.

## Medium term

- Move business logic into service classes.
- Centralize frontend API calls.
- Add timeouts/circuit breaker around FastAPI.
- Precompute embeddings when profiles change.
- Add database indexes and pagination.
- Replace frontend mock match state with backend state.
- Implement real Google OAuth.
- Add WebSocket chat.

## Long term

- Vector-index candidate retrieval.
- Domain-specific compatibility model and evaluation dataset.
- Real identity-verification provider if legally/commercially appropriate.
- Distributed chat/message infrastructure.
- Formal privacy/security review.
- Audit logging and moderation/reporting.
- Scalable deployment, metrics, tracing, and SLOs.

---

# 21. Interview question bank

## Basic questions

### What is InTune?

**Short answer:** An AI-assisted roommate matching application using lifestyle descriptions, anonymous chat, and mutual matching.

**Detailed answer:** React collects user input, Spring Boot handles authentication and business operations, MongoDB stores the data, and FastAPI performs semantic similarity inference with Sentence Transformers.

**Evidence:** `App.tsx`, `AuthController`, `User`, `ai_service/main.py`.

**Follow-up:** What does “AI matching” mean technically? It means embeddings plus cosine similarity, not a generative chatbot.

### What is the frontend stack?

**Answer:** React 18, TypeScript, Vite, Tailwind, local shadcn/Radix-style UI components, React Router, and `fetch`.

### What is the backend stack?

**Answer:** Java 17, Spring Boot 3.3.2, Spring Web, Spring Security, JJWT, BCrypt, and Spring Data MongoDB.

### What database do you use?

**Answer:** MongoDB, with collections for users, matches, messages, and expenses.

### How is the backend authenticated?

**Answer:** JWTs are generated at login, stored by the frontend, sent as Bearer tokens, validated in `JwtAuthenticationFilter`, and converted into a `User` principal.

## Intermediate questions

### What happens when a user signs up?

**Answer:** The browser OCR-processes the document and validates the number with Verhoeff. It sends the extracted data to `/register`. The backend checks duplicates, BCrypt-hashes the password, SHA-256-hashes the identity number, creates a user document, saves it, issues a JWT, and returns it.

**Follow-up:** Is this government identity verification? No. It is client-side OCR plus checksum and duplicate-hash checking.

### What happens when a user requests matches?

**Answer:** Spring loads other verified users, sends the current and candidate lifestyle texts to FastAPI, receives scores, falls back to Jaccard if needed, sorts candidates, and returns them to the frontend.

### Why use a separate AI service?

**Answer:** The model ecosystem is Python-native, so a small FastAPI service isolates ML dependencies from the Java API and can scale independently. The tradeoff is another network and failure boundary.

### How does mutual matching work?

**Answer:** A match document stores two directional booleans. The IDs are sorted to normalize the pair. When both booleans are true, status becomes `matched`; the confirmed-match endpoint then returns real profile details.

### Is chat real-time?

**Answer:** No. It uses HTTP message creation/history APIs and frontend polling every three seconds. WebSockets are listed as future work.

### What does the fallback do?

**Answer:** It lowercases and tokenizes both texts, calculates Jaccard intersection over union, and maps that result into the same UI score range. It preserves availability but not semantic quality.

## Advanced questions

### What is the bottleneck in matching?

**Answer:** The backend loads all candidate users and sends all candidate texts to FastAPI on every request. Inference and payload size grow with user count. I would precompute embeddings and use vector top-k search.

### What happens if two likes arrive concurrently?

**Answer:** The current read-modify-save approach could lose an update under a race. I would use atomic Mongo updates or optimistic locking and test simultaneous likes.

### What happens if FastAPI hangs?

**Answer:** The current code catches exceptions but does not visibly configure a timeout. A hang could delay the backend request. I would add client timeouts, circuit breaking, and metrics.

### How would you secure the webhook?

**Answer:** Require a provider signature or shared secret, validate timestamp/replay, validate the payload schema, and make processing idempotent. The current endpoint is public and does not show signature validation.

### Why is the 90% score not necessarily 90% compatibility?

**Answer:** The score is a cosine similarity mapped into a UX range of 55–98. It is not calibrated against real roommate outcomes.

### What would you change first for production?

**Answer:** Fix auth/privacy boundaries: safe response DTOs, secure token storage, strict CORS, real OAuth verification, webhook authentication, chat authorization, and production secrets. Then improve matching scale with precomputed embeddings/vector search.

## Follow-up “why” questions

### Why not keyword matching only?

Because “night owl” and “sleeps late” may have related meanings without sharing many exact words. The semantic model can capture that relationship better.

### Why not put the model inside Spring Boot?

Because the selected model stack is Python-oriented. Keeping it in FastAPI simplifies dependency management.

### Why not SQL?

MongoDB fit the flexible document-shaped prototype. SQL would be a reasonable alternative, especially if strong relationships, constraints, reporting, or transactions became more important.

### Why not store embeddings in MongoDB?

The current code does not store embeddings at all. A future design could store them and use MongoDB vector search or another vector system.

### Why not reveal real identity immediately?

The product intent is to let users assess compatibility before sharing personal information. The implementation returns real details only from confirmed matches, but authorization/privacy hardening is still needed.

## Debugging questions

### The match page is empty. What do you check?

1. Is the JWT present and valid?
2. Does `/api/auth/me` work?
3. Does the current user have non-empty `vibeText`?
4. Are other users marked `isVerified`?
5. Is `AI_SIMILARITY_URL` correct?
6. Is FastAPI healthy at `/`?
7. Does fallback execute if FastAPI fails?
8. Are frontend and backend response fields aligned?

### Voice survey says no profile data found. What do you check?

1. Is OmniDimension loaded?
2. Did the completion event arrive?
3. Did the webhook reach `/api/webhook/omnidim`?
4. Does webhook payload contain an email matching the stored user?
5. Is profile text extracted under a supported key?
6. Do all profile reads use `GET /auth/me` while updates use `PUT /auth/profile`?

### Chat does not update immediately. Why?

Because the implementation polls every three seconds; it is not push-based. Check the interval, endpoint, token, and message query.

### Login returns 401. What do you check?

Check email normalization, whether the user exists, whether the submitted password matches BCrypt, MongoDB connectivity, and whether the frontend is calling the correct API base URL.

## Security questions

### Is localStorage JWT storage secure?

Not fully. XSS can read it. HttpOnly secure cookies are safer for many browser applications.

### Is the identity number encrypted?

The code hashes it with SHA-256 before storage. Hashing is not encryption and cannot be reversed in the normal way, but raw data is still transmitted to the backend during registration.

### Is the webhook secure?

Not visibly. It is publicly permitted and no signature verification is shown.

### Is authorization implemented beyond login?

Only coarse route authentication is clearly implemented. Resource-level checks for chat recipient, expenses, and profile exposure are incomplete.

## Database questions

### How do you prevent duplicate match records?

The IDs are sorted and a unique compound index is placed on `userA,userB`.

### How are relationships represented?

By storing string user IDs in match, message, and expense documents.

### Do you use database transactions?

No explicit transaction usage was found.

## Frontend questions

### Why is the API logic repeated?

The repository has a generic `API` helper, but many pages use direct `fetch`. This is a refactoring opportunity for consistency.

### What is React state doing in the chat?

It stores current messages, input text, recipient, candidate list, and reveal state. Effects load data and polling updates it.

## AI questions

### Does the model understand roommate compatibility directly?

No. It measures semantic similarity between descriptions. Product compatibility is an interpretation layered on top.

### How do you evaluate model quality?

No evaluation dataset or metrics are in the repository. A future system should collect feedback and validate predictions against outcomes.

### How do you reduce hallucinations?

Hallucination is mainly an LLM issue, and this project does not use a generative LLM for matching. The model emits numerical similarity scores. The broader risk is misinterpreting similarity as compatibility.

---

# 22. Rapid-fire questions and answers

1. **Project purpose?** AI-assisted roommate matching.
2. **Frontend?** React and TypeScript.
3. **Build tool?** Vite.
4. **Styling?** Tailwind and local shadcn-style components.
5. **Backend?** Java Spring Boot.
6. **Database?** MongoDB.
7. **Authentication?** JWT with Spring Security.
8. **Password storage?** BCrypt hash.
9. **Token storage?** Browser localStorage.
10. **Token expiration?** Seven days from configuration.
11. **Model service?** Python FastAPI.
12. **Model?** `all-MiniLM-L6-v2`.
13. **Model output?** 384-dimensional embeddings.
14. **Similarity?** Cosine similarity.
15. **Fallback?** Jaccard word overlap.
16. **Candidate source?** Verified users excluding current user.
17. **Score range?** AI service maps to 55–98.
18. **Why 384?** The selected model outputs that dimension.
19. **Where does matching run?** FastAPI for semantic score, Java for fallback.
20. **What stores vibe text?** `User.vibeText` in MongoDB.
21. **Voice provider?** OmniDimension plus browser SpeechRecognition.
22. **OCR library?** Tesseract.js.
23. **Checksum?** Verhoeff.
24. **Does OCR upload image?** It runs in browser; raw extracted number is later sent.
25. **Chat transport?** HTTP REST plus three-second polling.
26. **WebSockets?** Not implemented.
27. **Chat storage?** MongoDB `messages` collection.
28. **Match storage?** MongoDB `matches` collection.
29. **Match status?** `pending` or `matched`.
30. **How is pair normalized?** IDs sorted lexicographically.
31. **When reveal happens?** Confirmed-match endpoint returns real details.
32. **Separate reveal endpoint?** No.
33. **Expense storage?** MongoDB `expenses` collection.
34. **Payment provider?** None.
35. **Google OAuth?** Not actually verified.
36. **External webhook?** `/api/webhook/omnidim`.
37. **Webhook auth?** No visible signature verification.
38. **CORS?** Broad wildcard patterns.
39. **CSRF?** Disabled because API is stateless; token storage/security still needs review.
40. **Service layer?** None in repository.
41. **Repository layer?** Spring Data repository interfaces.
42. **Controller layer?** Auth, chat, expense, webhook controllers.
43. **Testing?** No test files found.
44. **Deployment frontend?** Vercel configuration.
45. **Deployment backend?** Docker/Render-oriented.
46. **AI deployment?** Docker/Render-oriented.
47. **Model caching?** No embedding cache; model loaded once per AI process.
48. **Candidate pagination?** Not implemented.
49. **Vector database?** None.
50. **Biggest matching bottleneck?** Brute-force all candidates and recompute embeddings.
51. **Biggest security issue?** Broad/public trust boundaries and localStorage token storage.
52. **Profile endpoint contract?** Reads use `/auth/me`; updates use `PUT /auth/profile`.
53. **Biggest chat limitation?** Polling and incomplete authorization.
54. **Biggest identity limitation?** Checksum is not authenticity verification.
55. **First production improvement?** Secure authentication/data exposure and add tests.

---

# 23. “Explain this code” examples

## JWT filter

```java
String jwt = getJwtFromRequest(request);

if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
    String userId = tokenProvider.getUserIdFromJWT(jwt);
    Optional<User> userOpt = userRepository.findById(userId);
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
```

### Explanation

The code extracts a Bearer token, verifies its signature/expiry, loads the user, creates a Spring authentication object, and stores it in the request's security context. Controllers later retrieve that principal.

### What could go wrong?

- token missing/expired;
- secret mismatch;
- user deleted after token issue;
- database unavailable;
- token stolen from localStorage.

### Interview follow-up

Why load the user from MongoDB instead of trusting all user data in the token? Because the database is the current source of truth and the token only carries identity claims. The current token contains user ID, not the complete user profile.

## FastAPI similarity mapping

```python
anchor_embedding = model.encode(request.anchor, convert_to_tensor=True)
candidate_embeddings = model.encode(request.candidates, convert_to_tensor=True)
cosine_scores = util.cos_sim(anchor_embedding, candidate_embeddings)[0]
```

### Explanation

The model converts the anchor and candidate strings into tensors. `cos_sim` compares the anchor against every candidate and produces one score per candidate.

## Match pair normalization

```java
String firstUser = userA.compareTo(userB) < 0 ? userA : userB;
String secondUser = userA.compareTo(userB) < 0 ? userB : userA;
```

### Explanation

This ensures the same pair always has the same order. Without it, A-B and B-A could become separate records.

## Verhoeff loop

```typescript
const myArray = clean.split("").map(Number).reverse();
for (let i = 0; i < myArray.length; i++) {
  c = verhoeffTableD[c][verhoeffTableP[i % 8][myArray[i]]];
}
return c === 0;
```

### Explanation

The algorithm processes digits from right to left through predefined multiplication/permutation tables. A final accumulator of zero indicates checksum validity.

### Important distinction

It validates the number's structure, not whether the document is genuine or owned by the user.

## Jaccard fallback

```java
Set<String> intersection = new HashSet<>(words1);
intersection.retainAll(words2);

Set<String> union = new HashSet<>(words1);
union.addAll(words2);

double jaccard = (double) intersection.size() / union.size();
```

### Explanation

The score is based on unique shared words divided by all unique words. It is simple and fast but does not understand synonyms or sentence meaning.

## Controller-to-FastAPI call

```java
Map<String, Object> response =
    restTemplate.postForObject(aiSimilarityUrl, payload, Map.class);
```

### Explanation

Spring serializes the payload as an HTTP request, waits for a response, deserializes it into a generic map, and reads the `scores` list.

### Improvement

Use typed request/response DTOs, timeouts, validation, service abstraction, and resilience policies instead of a raw `Map` and default `RestTemplate` behavior.

---

# 24. Project story

> The project started from a roommate discovery problem: fixed filters do not describe the nuances of living together, and people may not want to reveal their identity immediately. I built InTune as a full-stack application where users can describe their lifestyle in natural language or through voice. The React frontend talks to a Spring Boot backend, and MongoDB stores the profile, match, chat, and expense documents.
>
> The most technically distinctive part is the matching flow. The backend sends lifestyle descriptions to a separate Python FastAPI service using Sentence Transformers. The model creates embeddings and cosine similarity produces a semantic score. I also added a local Jaccard fallback so the main application can still return candidates if the model service is unavailable.
>
> The user experience uses anonymous aliases during early communication. Likes are stored directionally in a normalized match document, and the status changes to matched when both users like each other. Confirmed matches can then expose real profile information.
>
> Other meaningful integrations include browser OCR with Verhoeff validation for the identity-number flow and an OmniDimension webhook for voice onboarding. The current version is a prototype, so I would improve production security, real OAuth verification, webhook authentication, chat authorization, vector-search scalability, API consistency, tests, and WebSocket delivery.

This story is safe because it does not claim undocumented personal motivations or unimplemented production guarantees.

---

# 25. Answer-length templates

## “How does authentication work?”

### 10-second answer

> Login verifies the BCrypt password, creates a JWT, and the frontend sends it as a Bearer token on protected requests.

### 30-second answer

> `AuthController` verifies the submitted password using BCrypt and `JwtTokenProvider` creates an HS256 token containing the user ID and expiry. The frontend stores it in localStorage and sends it in the Authorization header. `JwtAuthenticationFilter` validates it, loads the user from MongoDB, and places that user in Spring Security's context.

### 1-minute answer

> Registration hashes the password and saves the user. Login looks up the email and calls `PasswordEncoder.matches`; the raw password is never compared directly with a stored plaintext password. A JWT is created with the user ID, issue time, and seven-day expiry. The frontend stores it and attaches it to API requests. On each protected request, the filter extracts and validates the signature and expiry, loads the user, and sets a `UsernamePasswordAuthenticationToken`. Controllers use `SecurityContextHolder` to identify the user. The current weakness is localStorage token storage, broad CORS, and a default secret fallback.

### If asked “Why JWT?”

> It provides stateless authentication between separately deployed frontend and backend services. I would use more secure cookie/refresh-token handling for production.

## “How does AI matching work?”

### 10-second answer

> Lifestyle text is converted into embeddings and compared with cosine similarity; Java falls back to Jaccard overlap if FastAPI fails.

### 30-second answer

> `/api/auth/candidates` loads verified users and sends one anchor description plus a candidate list to FastAPI. `all-MiniLM-L6-v2` creates 384-dimensional embeddings, cosine similarity produces one score per candidate, and the service maps scores into 55–98. Spring sorts the candidates and returns them.

### 1-minute answer

> The model captures semantic similarity rather than exact word overlap. FastAPI loads the model once, encodes the anchor and all candidates, uses `util.cos_sim`, clips the result, and maps it into a UX range. The current design recomputes all candidate embeddings on each request and does not use a vector database. The fallback is Jaccard word overlap, which improves availability but may produce poorer semantic matches. The score is not a calibrated probability or proof that two users will be compatible.

### If asked “How would you improve it?”

> Precompute embeddings when profiles change, use vector top-k retrieval, model compatibility categories explicitly, collect user feedback, calibrate scores, and add service timeouts/circuit breaking.

## “What would you improve?”

### 10-second answer

> I would first harden authentication, privacy, API authorization, and tests, then improve matching scale with precomputed embeddings and vector search.

### 30-second answer

> The current prototype works end to end, but I would continue hardening privacy, webhook verification, JWT handling, authorization, and testing. For scale, I would precompute embeddings and replace brute-force candidate comparison with vector search.

### If challenged

> I would not call the current version production-perfect. Its strongest prototype choices are the separated ML service and graceful matching fallback; its main weaknesses are security hardening, authorization depth, API consistency, testing, and scaling strategy.

---

# 26. Confirmed facts vs inference

## Confirmed from code

- React 18/TypeScript/Vite frontend exists.
- Spring Boot 3.3.2/Java 17 backend exists.
- MongoDB models are `User`, `Match`, `Message`, and `Expense`.
- Spring Security uses a custom JWT filter.
- BCrypt hashes passwords.
- JWT expiration is configured to seven days.
- FastAPI exposes `/api/similarity`.
- `all-MiniLM-L6-v2` is loaded by Sentence Transformers.
- Cosine similarity is used in Python.
- Score mapping is 55–98.
- Jaccard fallback exists in Java.
- Browser OCR uses Tesseract.js.
- Verhoeff validation exists in `Signup.tsx`.
- Raw identity number is sent during registration; SHA-256 hash is stored.
- OmniDimension script/widget and webhook code exist.
- Chat uses REST and three-second frontend polling.
- Mutual match uses two directional like flags and `matched` status.
- Expense endpoints exist.
- Dockerfiles exist for backend and AI service.
- Vercel SPA rewrite exists.
- No WebSocket/WebRTC implementation was found.
- No payment provider integration was found.
- No test source files were found.
- No backend service package was found.
- Frontend profile reads use `GET /auth/me`; profile updates use `PUT /auth/profile`.

## Reasonable inferences

- React was chosen because the UI is highly interactive.
- Spring Boot was chosen for structured Java REST/security/Mongo support.
- MongoDB was chosen for flexible document storage and prototype speed.
- FastAPI was chosen because the model stack is Python-native.
- Anonymous IDs were intended to reduce early identity exposure.
- Jaccard fallback was intended to provide graceful degradation.
- Browser OCR was intended to avoid sending the document image itself.
- The three-service boundary allows independent ML deployment/scaling.

The exact original personal/design motivations are not documented, so these should be phrased as technically reasonable explanations rather than historical facts.

## Unknown / cannot determine

- Whether the author measured matching accuracy.
- Whether the app has real users or production traffic.
- Why exactly the score range 55–98 was chosen beyond the code comment about UX scaling.
- Whether OmniDimension's production webhook payload exactly matches every fallback key handled.
- Whether Render and Vercel deployments are currently live, beyond README/configuration evidence.
- Whether security headers, secrets, logs, and database configuration are managed outside this repository.
- Whether the frontend mock state is deliberate demo behavior or unfinished implementation.
- Whether a real legal/privacy review was performed.

---

# 27. Master project cheat sheet

## Purpose

AI-assisted roommate discovery based on natural-language lifestyle compatibility, anonymous communication, and mutual consent.

## Stack

React + TypeScript + Vite + Tailwind frontend; Java 17 + Spring Boot 3.3.2 backend; MongoDB; Python FastAPI; Sentence Transformers; `all-MiniLM-L6-v2`; Tesseract.js; Verhoeff; OmniDimension; Docker; Vercel/Render-oriented deployment.

## Architecture

```text
React browser
  → Spring Boot REST API + JWT
  → MongoDB
Spring Boot
  → FastAPI /api/similarity
Browser
  ↔ OmniDimension widget
OmniDimension
  → Spring Boot webhook
```

## Main backend classes

- `AuthController`: auth, profiles, candidates, likes, confirmed matches.
- `ChatController`: messages and chat count.
- `ExpenseController`: expense ledger.
- `WebhookController`: OmniDimension callback.
- `JwtAuthenticationFilter`: token-to-principal processing.
- `JwtTokenProvider`: token creation/validation.
- `SecurityConfig`: public/protected routes, CORS, stateless security.
- `DatabaseSeeder`: demo records.

## Main endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google-login
GET  /api/auth/me
PUT  /api/auth/profile
GET  /api/auth/candidates
POST /api/auth/like
GET  /api/auth/matches
POST /api/auth/chat
GET  /api/auth/chat/{recipientId}
GET  /api/auth/chats/count
POST /api/auth/splits
GET  /api/auth/splits?roommateId=...
POST /api/webhook/omnidim
```

## Authentication

BCrypt password verification → HS256 JWT → browser localStorage → Bearer header → JWT filter → MongoDB user principal.

## AI matching

Lifestyle text → 384-dimensional embeddings → cosine similarity → 55–98 UX score → sorted candidates. FastAPI failure → Java Jaccard fallback.

## Identity

Browser Tesseract OCR → candidate number extraction → Verhoeff checksum → raw number sent to backend → SHA-256 hash stored. This is not government-backed identity verification.

## Matching state

Two sorted user IDs → two like booleans → both true → `matched` → `/matches` returns real name/email.

## Chat

MongoDB messages, REST creation/history, three-second polling; no WebSockets.

## Payment

No provider or backend payment flow. Frontend QR/payment-app UI only.

## Biggest strengths

- Clear separation of the ML runtime from the Java backend.
- Semantic matching rather than only exact keyword filters.
- Explicit AI fallback.
- Anonymous-first product concept.
- Covers a broad end-to-end full-stack flow.

## Biggest limitations

- Full candidate brute-force matching.
- No precomputed/vector search.
- Incomplete resource authorization.
- JWT in localStorage and weak default secret fallback.
- Public unsigned webhook.
- Broad CORS.
- Full `User` object responses.
- Placeholder Google login.
- Profile GET endpoint mismatch.
- Polling chat.
- No tests found.
- Frontend mock match state.

## Best closing interview answer

> InTune is a full-stack prototype that combines a React client, Spring Boot application backend, MongoDB persistence, and a Python semantic-matching service. The most important technical flow is the candidate endpoint: Spring loads verified profiles, FastAPI creates sentence embeddings and cosine scores, and Java falls back to Jaccard similarity if the model service is unavailable. The product uses anonymous aliases until a mutual like confirms a match. I understand that the current implementation still needs production hardening, especially around OAuth, webhook authentication, response privacy, chat authorization, API consistency, testing, and scalable vector search.
