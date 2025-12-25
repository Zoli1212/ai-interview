"use client"
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

import CreateInterviewDialog from '../_components/CreateLearningDialog';
import UploadKnowledgeDialog from '../_components/UploadKnowledgeDialog';
import { LearningData } from '../learning/[learningId]/start/page';
import EmptyState from './_components/EmptyState';
import InterviewCard from './_components/LearningCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getLearningSessions } from '@/lib/actions/learning-session';


function Dashboard() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState<LearningData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GetInterviewList();
    }, [user])

    const GetInterviewList = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const result = await getLearningSessions();
            console.log(result);
            //@ts-ignore
            setInterviewList(result);
        } catch (error) {
            console.error('Error fetching learning sessions:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='py-20 px-10 md:px-28 lg:px-44 xl:px-56'>

            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-lg text-gray-500'>My Dashboard</h2>
                    <h2 className='text-3xl font-bold'>Welcome, {user?.fullName} </h2>
                </div>
                <div className='flex gap-3'>
                    <UploadKnowledgeDialog />
                    <CreateInterviewDialog />
                </div>
            </div>
            {!loading && interviewList.length == 0 ?
                <EmptyState /> :
                <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10'>
                    {interviewList.map((interview, index) => (
                        <InterviewCard interviewInfo={interview} key={index} />
                    ))}
                </div>
            }

            {loading && <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10'>
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                    <div className="flex flex-col space-y-3" key={index}>
                        <Skeleton className="h-[125px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>}


        </div>
    )
}

export default Dashboard