"use client"
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { Loader2Icon, Upload } from 'lucide-react'
import { toast } from 'sonner'

function UploadKnowledgeDialog() {
    const [file, setFile] = useState<File | null>(null);
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
            } else {
                toast.error('Please upload a PDF file');
            }
        }
    };

    const onSubmit = async () => {
        // Validation
        if (!file) {
            toast.error('Please upload a PDF file');
            return;
        }
        if (!topic) {
            toast.error('Please provide a topic/category for this knowledge');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topic', topic);
        formData.append('description', description);

        try {
            const res = await axios.post('/api/upload-knowledge', formData);

            if (res?.data?.status === 200) {
                toast.success('Knowledge uploaded successfully!');
                // Reset form
                setFile(null);
                setTopic('');
                setDescription('');
                setOpen(false);
            } else {
                toast.error('Failed to upload knowledge');
            }
        } catch (e: any) {
            console.error(e);
            toast.error('Failed to upload: ' + (e.response?.data?.message || e.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Knowledge Base
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Upload Knowledge Base Material</DialogTitle>
                    <DialogDescription>
                        Upload PDF documents to add to the company knowledge base.
                        This knowledge will be available for all learning sessions.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div>
                        <Label htmlFor="pdf-upload">PDF Document *</Label>
                        <Input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className='mt-2'
                        />
                        {file && (
                            <p className='text-sm text-green-600 mt-2'>
                                Selected: {file.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="topic">Topic/Category *</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., Company Policies, Product Documentation, Training Materials"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className='mt-2'
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <textarea
                            id="description"
                            placeholder="Brief description of the content..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        />
                    </div>
                </div>

                <DialogFooter className='flex gap-2'>
                    <DialogClose asChild>
                        <Button variant='ghost' disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading && <Loader2Icon className='animate-spin mr-2' />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UploadKnowledgeDialog
