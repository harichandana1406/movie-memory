# Movie Memory 🎬

A premium full-stack application to track your favorite movie and discover AI-generated fun facts.

**Chosen Variant: Variant A — Backend-Focused (Caching & Correctness)**  
*Reasoning: Prioritized backend reliability, data integrity, and cost-effective AI usage through robust caching and concurrency control.*

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey) (for Free Gemini API)
- [Google Cloud Console Project](https://console.cloud.google.com/) (for OAuth 2.0 Credentials)

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Google Gemini (Free Tier)
GOOGLE_GEMINI_API_KEY="AIzaSy..."
```

### 3. Installation & Database Setup
```bash
npm install
npx prisma db push
npm run dev
```

### 4. Running Backend Tests
```bash
npx -y tsx --env-file=.env.local scripts/test-backend.ts
```

---

## 🏛️ Architecture Overview

The application follows a modular Next.js architecture designed for scalability and correctness.

### Core Components:
- **Next.js App Router**: Utilizes Server Components for data fetching and Client Components for interactive UI elements.
- **Prisma + SQLite**: Chosen for zero-config local development while maintaining type-safety and robust schema migrations.
- **NextAuth.js**: Implements the OpenID Connect flow with Google, persisting sessions in the local database.
- **Gemini Fact Service (`lib/facts.ts`)**: The heart of the application. It encapsulates the caching, burst protection, and failure handling logic in a single, reusable service.

### Fact Generation Lifecycle:
1. **Cache Check**: Queries `MovieFact` table for a record < 60s old.
2. **Concurrency Lock**: If generation is needed, claims a `GenerationLock` for the `userId`.
3. **AI Generation**: Calls Google Gemini 1.5 Flash.
4. **Persistence**: Stores the new fact and releases the lock.
5. **Fallback**: If the AI fails, a `try-catch` block ensures the most recent cached fact is returned instead of an error.

---

## ⚖️ Tradeoffs & Decisions

### 1. Database-Backed Locking vs. In-Memory
I chose to use a **`GenerationLock` table** in SQLite rather than an in-memory lock (like a simple JS Set).  
- **Tradeoff**: Slightly more DB writes.  
- **Benefit**: Ensures correctness across multiple processes or horizontal scaling (if moved to a distributed DB), which in-memory locks cannot guarantee.

### 2. SQLite for Development
I switched from PostgreSQL to SQLite to provide a **"zero-dependency" setup** for reviewers.  
- **Tradeoff**: Limited concurrency compared to Postgres.  
- **Benefit**: Immediate project startup without requiring a local Postgres instance or Docker.

### 3. Stale Lock Recovery
A common risk with locks is a crash leaving a user "stuck." I implemented a **30-second stale check** on the `GenerationLock`. If a lock exists but is > 30s old, the system assumes a failure occurred and allows a new generation to proceed.

---

## 💡 AI Usage Notes
- **Fact Generation**: Engineered prompts for Gemini 1.5 Flash to ensure facts are "intriguing" and "under 200 characters."
- **Coding Assistance**: Used AI to accelerate the migration from OpenAI to Gemini and to brainstorm the idempotency guard logic.

---

## 🛠️ Future Improvements (2 More Hours)
1. **TMDB Integration**: Add an autocomplete search during onboarding so users select real movies (improving fact accuracy).
2. **User Fact History**: Allow users to scroll through a timeline of all facts generated for them.
3. **Loading States**: Implement a "Skeleton Screen" in the UI to improve perceived performance during the AI generation window.

---

## 🧠 Engineering Deep Dive (Reviewer Checklist)

### 1. Schema Design: Why this way?
- **Separation of Concerns**: Core identity data stays in the `User` model, while dynamic data is decoupled into `MovieFact`. This prevents the `User` table from becoming a "God Object" and allows for easy history/analytics.
- **Dedicated Locking Table**: `GenerationLock` allows us to track *when* a generation started, which is critical for solving the "stale lock" problem without over-complicating the `User` schema.

### 2. Caching Strategy: DB-Backed over In-Memory
- **Statelessness**: Next.js is designed to be stateless (Serverless/Pods). An in-memory cache would lead to "split-brain" where different tabs show different facts. Database-backed caching is the only way to ensure the **60-second window is global** and consistent for the user.

### 3. Tradeoffs & Failure Cases
- **Safety over Speed**: I used atomic database `upsert` and `delete` for the lock. It's slightly slower than in-memory, but it eliminates race conditions.
- **Graceful Error Recovery**: The `try-catch-finally` block in `facts.ts` is the cornerstone of the app's reliability. It handles:
  - **AI Timeout**: Fallback to cache.
  - **User Refresh**: Burst protection via lock.
  - **Crash Recovery**: 30s stale lock timeout.
