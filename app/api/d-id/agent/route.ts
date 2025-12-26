import { NextRequest, NextResponse } from 'next/server'

const DID_API_KEY = process.env.DI_D_API_KEY
const DID_AGENT_ID = process.env.NEXT_PUBLIC_DID_AGENT_ID

export async function GET(request: NextRequest) {
  try {
    if (!DID_API_KEY || !DID_AGENT_ID) {
      return NextResponse.json(
        { error: 'D-ID API credentials not configured' },
        { status: 500 }
      )
    }

    // Fetch agent details from D-ID API
    const response = await fetch(`https://api.d-id.com/agents/${DID_AGENT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[D-ID Proxy] Error:', response.status, errorText)
      return NextResponse.json(
        { error: `D-ID API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[D-ID Proxy] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!DID_API_KEY || !DID_AGENT_ID) {
      return NextResponse.json(
        { error: 'D-ID API credentials not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { endpoint, method = 'POST', data: requestData } = body

    // Forward request to D-ID API
    const response = await fetch(`https://api.d-id.com/agents/${DID_AGENT_ID}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestData ? JSON.stringify(requestData) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[D-ID Proxy] Error:', response.status, errorText)
      return NextResponse.json(
        { error: `D-ID API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[D-ID Proxy] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
