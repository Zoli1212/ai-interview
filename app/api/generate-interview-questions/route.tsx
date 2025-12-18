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
        const jobTitle = formData.get('jobTitle') as File;
        const jobDescription = formData.get('jobDescription') as File;
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


            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: `upload-${Date.now()}.pdf`,
                isPrivateFile: false, // optional
                useUniqueFileName: true,
            });


            // Call n8n Webhook

            const result = await axios.post('https://jane21.app.n8n.cloud/webhook/0469141a-01d5-4ea1-a0de-4ac18321dd6a', {
                resumeUrl: uploadResponse?.url
            });

            return NextResponse.json({
                questions: result.data?.interview_questions,
                resumeUrl: uploadResponse?.url,
                status: 200
            });
        } else {
            const result = await axios.post('https://jane21.app.n8n.cloud/webhook/0469141a-01d5-4ea1-a0de-4ac18321dd6a', {
                resumeUrl: null,
                jobTitle: jobTitle,
                jobDescription: jobDescription
            });

            return NextResponse.json({
                questions: result.data?.interview_questions,
                resumeUrl: null
            });
        }

    } catch (error: any) {
        console.error('Error generating interview questions:', error);
        return NextResponse.json({
            error: error.message,
            status: error.response?.status || 500
        }, { status: 500 });
    }
}