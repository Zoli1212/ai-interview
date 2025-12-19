import { NextRequest, NextResponse } from 'next/server';

const D_ID_API_KEY = process.env.DI_D_API_KEY;
const D_ID_API_URL = 'https://api.d-id.com';

export async function POST(req: NextRequest) {
  try {
    const { script, source_url } = await req.json();

    if (!D_ID_API_KEY) {
      return NextResponse.json(
        { error: 'D-ID API key is missing' },
        { status: 500 }
      );
    }

    // Create a talk using D-ID API
    const response = await fetch(`${D_ID_API_URL}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${D_ID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural', // Professional female voice
          },
        },
        source_url: source_url || 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg', // Default avatar
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('D-ID API Error:', data);
      return NextResponse.json(
        { error: 'Failed to create talk', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error('Error creating D-ID talk:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
