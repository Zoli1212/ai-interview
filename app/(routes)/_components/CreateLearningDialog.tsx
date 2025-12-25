import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import JobDescription from './JobDescription'
import { Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createLearningSession } from '@/lib/actions/learning-session'

function CreateInterviewDialog() {

    const [formData, setFormData] = useState<any>();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onHandleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const onSubmit = async () => {
        // Validation: Only topic is required
        if (!formData?.jobTitle) {
            toast.error('Please provide a topic title');
            return;
        }

        setLoading(true);

        try {
            // Create learning session directly (no file upload)
            const sessionId = await createLearningSession({
                materialUrl: null,
                topic: formData.jobTitle,
                topicDescription: formData?.jobDescription || null
            });

            toast.success('Interview session created!');
            router.push('/learning/' + sessionId);

        } catch (e: any) {
            console.error(e);
            toast.error('Failed to create learning session: ' + (e.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }


    return (
        <Dialog>
            <DialogTrigger>
                <Button>+ Start New Interview</Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Create Interview Session</DialogTitle>
                    <DialogDescription>
                        Create a new interview session. The AI interviewer will conduct a free-form conversation based on your company's knowledge base.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <JobDescription onHandleInputChange={onHandleInputChange} />
                </div>
                <DialogFooter className='flex gap-6'>
                    <DialogClose>
                        <Button variant={'ghost'}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={loading} >
                        {loading && <Loader2Icon className='animate-spin' />} Submit</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default CreateInterviewDialog
