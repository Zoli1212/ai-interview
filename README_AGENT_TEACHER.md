# 🎓 Agent Teacher - AI-Powered Learning Platform

Corporate learning platform where an AI teacher tests knowledge based on uploaded study materials using D-ID avatars and RAG technology.

## 🚀 Features

- **PDF Upload**: Upload learning materials (study guides, textbooks, documentation)
- **RAG-Powered Questions**: AI generates questions from your materials using PostgreSQL pgvector
- **Interactive AI Teacher**: D-ID streaming avatar asks questions and provides feedback
- **Voice Interaction**: Speak your answers using Web Speech API
- **Progress Tracking**: Save learning sessions and review feedback
- **Clerk Authentication**: Secure user management

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Auth** | Clerk |
| **Database** | PostgreSQL + pgvector (via Prisma) |
| **AI Avatar** | D-ID Agent SDK |
| **Storage** | ImageKit (PDF hosting) |
| **Automation** | n8n (PDF → RAG pipeline) |
| **UI** | shadcn/ui + Tailwind CSS |
| **Rate Limiting** | Arcjet |

## 📊 Architecture

```
User → Upload PDF → ImageKit → n8n Webhook → pgvector (rag_chunks)
                                              ↓
User ← D-ID Avatar ← Questions ← RAG Query ← PostgreSQL
```

## 🔧 Setup

### 1. Environment Variables

Create `.env` file:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# PostgreSQL with pgvector
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# ImageKit (PDF hosting)
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx
IMAGEKIT_URL_PUBLIC_KEY=public_xxx
IMAGEKIT_URL_PRIVATE_KEY=private_xxx

# D-ID Avatar
DI_D_API_KEY=xxx:xxx
NEXT_PUBLIC_DID_AGENT_ID=v2_agt_xxx
NEXT_PUBLIC_DID_CLIENT_KEY=xxx

# Arcjet (rate limiting)
ARCJET_KEY=ajkey_xxx
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Or push schema (development)
npx prisma db push
```

### 4. Setup n8n Workflow

Import the workflow from `RAG PDF ingest -_ Neon PGVector.json`

**Workflow Steps:**
1. Webhook receives PDF URL
2. PDF Loader extracts text
3. Recursive Text Splitter chunks content
4. OpenAI generates embeddings (text-embedding-3-small)
5. Store in pgvector `rag_chunks` table

### 5. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 📁 Project Structure

```
ai-interview/
├── app/
│   ├── (routes)/
│   │   ├── dashboard/          # Learning sessions list
│   │   ├── interview/[id]/     # Learning session page
│   │   └── _components/        # Shared components
│   ├── api/
│   │   └── generate-learning-questions/  # PDF → RAG endpoint
│   ├── _components/            # Landing page components
│   └── layout.tsx
├── prisma/
│   └── schema.prisma           # Database schema
├── lib/
│   └── prisma.ts               # Prisma client
└── convex/                     # (To be removed)
```

## 🔄 User Flow

1. **Sign Up/In** with Clerk
2. **Create Learning Session**:
   - Upload PDF material OR
   - Enter topic manually
3. **n8n processes PDF** → stores in pgvector
4. **Start Session**: D-ID avatar appears
5. **AI Teacher asks questions** based on RAG
6. **User answers verbally** (Web Speech API)
7. **Feedback generated** and saved
8. **Review past sessions** in dashboard

## 🗄️ Database Schema

```prisma
model User {
  id               String            @id @default(cuid())
  clerkId          String            @unique
  email            String            @unique
  name             String?
  imageUrl         String?
  learningSessions LearningSession[]
}

model LearningSession {
  id               String   @id @default(cuid())
  userId           String
  topic            String?
  materialUrl      String?
  questions        Json     // Generated questions
  feedback         Json?    // AI feedback
  status           String   @default("draft")
  createdAt        DateTime @default(now())
}

model RagChunk {
  id        String                   @id @default(cuid())
  content   String
  embedding Unsupported("vector(1536)")?
  metadata  Json?
  userId    String?
}
```

## 🎯 Key Terminology

| Old (Interview) | New (Learning) |
|----------------|----------------|
| Interview | Learning Session |
| Resume | Learning Material |
| Candidate | Learner |
| Interviewer | Teacher |
| Job Description | Topic/Subject |

## 🔌 API Endpoints

### POST `/api/generate-learning-questions`

**Request:**
```typescript
FormData {
  file: File,              // PDF file
  jobTitle: string,        // Topic name
  jobDescription: string   // Additional context
}
```

**Response:**
```typescript
{
  questions: Question[],
  materialUrl: string,
  status: 200
}
```

## 🚧 TODO (Optional)

- [ ] Migrate from Convex to Prisma (in progress)
- [ ] Add RAG query API for D-ID agent
- [ ] Rename `/interview/` routes to `/learning-session/`
- [ ] Update remaining UI components (InterviewCard, etc.)
- [ ] Add learning analytics dashboard

## 📝 Notes

- **Convex**: Currently used, migrating to Prisma
- **pgvector**: Managed by n8n, queried via Prisma
- **D-ID Agent**: Configured in n8n as knowledge base source
- **Rate Limiting**: 5 free sessions per 24h (Arcjet)

## 🤝 Contributing

This is a corporate training platform. Contact admin for access.

---

**Status**: ✅ Core features complete, Prisma migration in progress
