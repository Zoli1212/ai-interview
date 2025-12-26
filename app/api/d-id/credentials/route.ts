import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return D-ID credentials from server-side environment variables
    const credentials = {
      agentId: process.env.NEXT_PUBLIC_DID_AGENT_ID,
      clientKey: process.env.NEXT_PUBLIC_DID_CLIENT_KEY,
    }

    if (!credentials.agentId || !credentials.clientKey) {
      return NextResponse.json(
        { error: 'D-ID credentials not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(credentials)
  } catch (error: any) {
    console.error('[D-ID Credentials] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
