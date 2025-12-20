import React from 'react'
import { InterviewData } from '../../learning/[learningId]/start/page'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import FeedbackDialog from './FeedbackDialog'

type props = {
    interviewInfo: InterviewData
}

function InterviewCard({ interviewInfo }: props) {
    return (
        <div className='p-5 border rounded-xl hover:shadow-md transition-shadow bg-white'>
            <div className='flex items-start gap-3 mb-3'>
                <div className='flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <BookOpen className='w-5 h-5 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                    <h2 className='font-semibold text-lg flex justify-between items-start gap-2'>
                        <span className='truncate'>
                            {interviewInfo?.resumeUrl ? 'Learning Session' : interviewInfo.jobTitle || 'Learning Session'}
                        </span>
                        <Badge variant={interviewInfo?.status === 'completed' ? 'default' : 'secondary'}>
                            {interviewInfo?.status}
                        </Badge>
                    </h2>
                </div>
            </div>
            
            <p className='line-clamp-2 text-sm text-gray-600 mb-4'>
                {interviewInfo?.resumeUrl 
                    ? 'AI teacher will ask questions based on your uploaded learning material.' 
                    : interviewInfo.jobDescription || 'Interactive learning session with AI teacher'}
            </p>

            <div className='flex justify-between items-center gap-3'>
                {interviewInfo?.feedback && <FeedbackDialog feedbackInfo={interviewInfo.feedback} />}
                <Link href={'/learning/' + interviewInfo?._id} className='ml-auto'>
                    <Button variant='outline' size='sm'>
                        {interviewInfo?.status === 'completed' ? 'Review' : 'Start Session'} 
                        <ArrowRight className='ml-2 w-4 h-4' />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default InterviewCard
