'use server'

const D_ID_API_KEY = process.env.DI_D_API_KEY;
const D_ID_API_URL = 'https://api.d-id.com';

export async function createDIDTalk(script: string, sourceUrl?: string) {
  try {
    console.log('[D-ID] Creating talk with script:', script.substring(0, 50) + '...');
    console.log('[D-ID] API Key present:', !!D_ID_API_KEY);

    if (!D_ID_API_KEY) {
      throw new Error('D-ID API key is missing');
    }

    // D-ID key format appears to be: base64(email):apiSecret
    // Need to base64 encode the whole thing for Basic auth
    const authToken = Buffer.from(D_ID_API_KEY).toString('base64');
    console.log('[D-ID] Using Basic auth');

    const response = await fetch(`${D_ID_API_URL}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: script,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural',
          },
        },
        source_url: sourceUrl || 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
        },
      }),
    });

    const data = await response.json();

    console.log('[D-ID] Response status:', response.status);
    console.log('[D-ID] Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('D-ID API Error:', data);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      throw new Error(`Failed to create talk: ${JSON.stringify(data)}`);
    }

    console.log('[D-ID] Talk created successfully! Talk ID:', data.id);

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('Error creating D-ID talk:', error);
    throw error;
  }
}

export async function getDIDTalk(talkId: string) {
  try {
    if (!talkId) {
      throw new Error('Talk ID is required');
    }

    if (!D_ID_API_KEY) {
      throw new Error('D-ID API key is missing');
    }

    // D-ID key format appears to be: base64(email):apiSecret
    // Need to base64 encode the whole thing for Basic auth
    const authToken = Buffer.from(D_ID_API_KEY).toString('base64');

    const response = await fetch(`${D_ID_API_URL}/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
      },
    });

    const data = await response.json();

    console.log('[D-ID] Get talk response status:', response.status);
    console.log('[D-ID] Talk status:', data.status);

    if (!response.ok) {
      console.error('D-ID API Error:', data);
      throw new Error('Failed to get talk');
    }

    if (data.status === 'done') {
      console.log('[D-ID] Video ready! URL:', data.result_url);
    } else if (data.status === 'error') {
      console.error('[D-ID] Video generation failed:', data.error);
    } else {
      console.log('[D-ID] Video still processing...');
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('Error getting D-ID talk:', error);
    throw error;
  }
}
