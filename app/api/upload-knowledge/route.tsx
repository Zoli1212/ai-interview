import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import axios from 'axios';

export async function POST(req: NextRequest) {
    // Initialize ImageKit only when needed
    const imagekit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_URL_PUBLIC_KEY || '',
        privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_URL_PRIVATE_KEY || '',
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
    });
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const topic = formData.get('topic') as string;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json(
                { message: 'No file provided' },
                { status: 400 }
            );
        }

        if (!topic) {
            return NextResponse.json(
                { message: 'Topic is required' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Upload to ImageKit for storage
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: 'knowledge-' + Date.now() + '.pdf',
            isPrivateFile: false,
            useUniqueFileName: true,
            tags: ['knowledge-base', topic],
        });

        console.log('[Knowledge Upload] ImageKit upload successful:', uploadResponse.url);

        // 2. Send PDF directly to n8n webhook for RAG processing
        const n8nFormData = new FormData();
        const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
        n8nFormData.append('file', pdfBlob, file.name);
        n8nFormData.append('userId', user.id);
        n8nFormData.append('topic', topic);
        n8nFormData.append('topicDescription', description || '');

        console.log('[Knowledge Upload] Sending to n8n webhook...');

        const n8nResponse = await axios.post(
            'https://jane21.app.n8n.cloud/webhook/0469141a-01d5-4ea1-a0de-4ac18321dd6a',
            n8nFormData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log('[Knowledge Upload] n8n response:', n8nResponse.data);

        return NextResponse.json({
            message: 'Knowledge uploaded successfully',
            materialUrl: uploadResponse.url,
            n8nResponse: n8nResponse.data,
            status: 200,
        });
    } catch (error: any) {
        console.error('[Knowledge Upload] Error:', error);
        return NextResponse.json(
            {
                message: 'Failed to upload knowledge',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
