"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

function Interview() {
    const { learningId } = useParams();
    const [copied, setCopied] = useState(false);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const shareLink = `${appUrl}/learning/${learningId}/start`;

    return (
        <div className='flex  flex-col items-center justify-center mt-14'>
            <div className='max-w-3xl w-full'>
                <Image src={'/interview.jpg'} alt='interview'
                    width={400}
                    height={200}
                    className='w-full h-[300px] object-cover'
                />
                <div className='p-6 flex flex-col items-center space-y-5'>
                    <h2 className='font-bold text-3xl text-center'>Ready to Start the Interview?</h2>
                    <p className='text-gray-500 text-center'>
                        The AI interviewer will conduct a natural conversation based on your company knowledge base. Are you ready to begin?
                    </p>
                    <Link href={'/learning/' + learningId + '/start'}>
                        <Button>Start Interview <ArrowRight /></Button>
                    </Link>

                    <hr />

                    <div className='p-6 bg-gray-50 rounded-2xl'>
                        <h2 className='font-semibold text-2xl'>Share Interview Link</h2>
                        <p className='text-sm text-gray-500 mt-2'>Copy this link and add it to your job posting. Candidates can click to start the interview.</p>
                        <div className='flex gap-3 w-full items-center max-w-2xl mt-4'>
                            <Input
                                value={shareLink}
                                readOnly
                                className='w-full font-mono text-sm bg-white'
                            />
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareLink);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? (
                                    <>
                                        <Check className='mr-2' size={16} />
                                        Copied
                                    </>
                                ) : (
                                    'Copy Link'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Interview