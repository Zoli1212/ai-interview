'use server'

import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function createLearningSession(data: {
  materialUrl?: string
  topic?: string
  topicDescription?: string
}) {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName || undefined,
      imageUrl: user.imageUrl || undefined,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName || undefined,
      imageUrl: user.imageUrl || undefined,
    },
  })

  const session = await prisma.learningSession.create({
    data: {
      userId: dbUser.id,
      materialUrl: data.materialUrl || null,
      topic: data.topic || null,
      topicDescription: data.topicDescription || null,
      status: 'draft',
    },
  })

  return session.id
}

export async function getLearningSession(sessionId: string) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })
  return session
}

export async function updateLearningSessionFeedback(
  sessionId: string,
  feedback: any
) {
  const session = await prisma.learningSession.update({
    where: { id: sessionId },
    data: {
      feedback,
      status: 'completed',
    },
  })
  return session
}

export async function getLearningSessions() {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser) return []

  const sessions = await prisma.learningSession.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  })

  return sessions
}

// RAG similarity search - queries pgvector for relevant chunks
export async function queryRagKnowledge(query: string, topK: number = 5) {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  try {
    // Get embedding for the query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    })

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Perform similarity search in pgvector
    const results = await prisma.$queryRaw`
      SELECT
        id,
        text,
        metadata,
        1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
      FROM rag_chunks
      WHERE "userId" = ${user.id}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
      LIMIT ${topK}
    ` as Array<{
      id: string
      text: string | null
      metadata: any
      similarity: number
    }>

    return results
  } catch (error: any) {
    console.error('Error in RAG query:', error)
    throw new Error('Failed to query knowledge base: ' + error.message)
  }
}
