import { NextRequest, NextResponse } from 'next/server';

const D_ID_API_KEY = process.env.D_ID_API_KEY;
const D_ID_API_URL = 'https://api.d-id.com';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const talkId = searchParams.get('talkId');

    if (!talkId) {
      return NextResponse.json(
        { error: 'Talk ID is required' },
        { status: 400 }
      );
    }

    if (!D_ID_API_KEY) {
      return NextResponse.json(
        { error: 'D-ID API key is missing' },
        { status: 500 }
      );
    }

    // Get talk status from D-ID API
    const response = await fetch(`${D_ID_API_URL}/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${D_ID_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('D-ID API Error:', data);
      return NextResponse.json(
        { error: 'Failed to get talk', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error('Error getting D-ID talk:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
