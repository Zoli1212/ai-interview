# 🚀 Quick Start Guide - Agent Teacher

## Prerequisites
- Node.js 18+
- PostgreSQL database with pgvector extension
- n8n instance (for RAG workflow)

## Step-by-Step Setup

### 1. Clone & Install
```bash
cd ai-interview
npm install
```

### 2. Configure Environment

Add your PostgreSQL connection string to `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Example (Neon):**
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/agentteacher?sslmode=require"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

This creates:
- `users` table
- `learning_sessions` table  
- `rag_chunks` table (with pgvector)

### 4. Import n8n Workflow

1. Open your n8n instance
2. Import `RAG PDF ingest -_ Neon PGVector.json`
3. Configure PostgreSQL credentials
4. Configure OpenAI API key
5. Activate the workflow

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Verify Setup

1. **Sign up** with Clerk
2. **Upload a PDF** (or enter topic manually)
3. Check n8n workflow executed successfully
4. Verify `rag_chunks` table has data:
   ```sql
   SELECT COUNT(*) FROM rag_chunks;
   ```
5. **Start learning session** - D-ID avatar should appear

## 🔍 Troubleshooting

### Prisma Client Error
```bash
npx prisma generate
```

### Database Connection Failed
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Test connection: `npx prisma db pull`

### pgvector Extension Missing
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### n8n Webhook Not Responding
- Check workflow is active
- Verify webhook URL in `generate-learning-questions/route.tsx`
- Test webhook: `curl -X POST https://jane21.app.n8n.cloud/webhook/rag/ingest-file`

### D-ID Agent Not Working
- Verify `DI_D_API_KEY` and `NEXT_PUBLIC_DID_AGENT_ID`
- Check browser console for errors
- Ensure microphone permissions granted

## 📚 Next Steps

- Customize AI teacher prompts in `start/page.tsx`
- Add custom questions in n8n workflow
- Configure Arcjet rate limits
- Deploy to Vercel/Railway

---

Need help? Check [README_AGENT_TEACHER.md](README_AGENT_TEACHER.md)
