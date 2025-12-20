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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createLearningSession } from '@/lib/actions/learning-session'
function CreateInterviewDialog() {

    const [formData, setFormData] = useState<any>();
    const [file, setFile] = useState<File | null>();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const onHandleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const onSubmit = async () => {
        setLoading(true);

        try {
            const formData_ = new FormData();
            formData_.append('file', file ?? '');
            formData_.append('jobTitle', formData?.jobTitle || '');
            formData_.append('jobDescription', formData?.jobDescription || '');

            const res = await axios.post('/api/generate-learning-questions', formData_);

            if (res?.data?.status === 429) {
                toast.warning(res?.data?.result);
                return;
            }

            // Create learning session (no questions field needed)
            const sessionId = await createLearningSession({
                materialUrl: res?.data?.materialUrl,
                topic: res?.data?.topic || formData?.jobTitle,
                topicDescription: res?.data?.topicDescription || formData?.jobDescription
            });

            toast.success(file ? 'Learning material uploaded!' : 'Learning session created!');
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
                <Button>+ Create Interview</Button>
            </DialogTrigger>
            <DialogContent className='min-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Please submit following details.</DialogTitle>
                    <DialogDescription>
                        <Tabs defaultValue="resume-upload" className="w-full mt-5">
                            <TabsList>
                                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                                <TabsTrigger value="job-description">Job Description</TabsTrigger>
                            </TabsList>
                            <TabsContent value="resume-upload"><ResumeUpload setFiles={(file: any) => setFile(file)} /></TabsContent>
                            <TabsContent value="job-description"><JobDescription onHandleInputChange={onHandleInputChange} /></TabsContent>
                        </Tabs>
                    </DialogDescription>
                </DialogHeader>
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