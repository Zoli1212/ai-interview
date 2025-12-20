import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import axios from "axios";
import { aj } from "@/utils/arcjet";
import { auth, currentUser } from "@clerk/nextjs/server";

//@ts-ignore
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const jobTitle = formData.get('jobTitle') as string;
        const jobDescription = formData.get('jobDescription') as string;
        const { has } = await auth();
        const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: 5 });
        const isSubscribedUser = has({ plan: 'pro' })
        //@ts-ignore
        if (decision?.reason?.remaining == 0 && !isSubscribedUser) {
            return NextResponse.json({
                status: 429,
                result: 'No free credit remaining, Try again after 24 Hours'
            })
        }

        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 1. Upload to ImageKit for storage and URL
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: 'learning-material-' + Date.now() + '.pdf',
                isPrivateFile: false,
                useUniqueFileName: true,
            });

            // 2. Send PDF directly to n8n webhook for RAG processing
            const n8nFormData = new FormData();
            // Create a Blob from the buffer and append as file
            const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
            n8nFormData.append('file', pdfBlob, file.name);
            n8nFormData.append('userId', user?.id || '');
            n8nFormData.append('topic', jobTitle || 'General Learning');
            n8nFormData.append('topicDescription', jobDescription || '');

            await axios.post('https://jane21.app.n8n.cloud/webhook/rag/ingest-file', n8nFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return NextResponse.json({
                materialUrl: uploadResponse?.url,
                topic: jobTitle || 'General Learning',
                topicDescription: jobDescription || '',
                status: 200
            });
        } else {
            // No file - just create session with topic
            return NextResponse.json({
                topic: jobTitle || 'General Learning',
                topicDescription: jobDescription || '',
                materialUrl: null,
                status: 200
            });
        }

    } catch (error: any) {
        console.error('Error generating learning questions:', error);
        return NextResponse.json({
            error: error.message,
            status: error.response?.status || 500
        }, { status: 500 });
    }
}
