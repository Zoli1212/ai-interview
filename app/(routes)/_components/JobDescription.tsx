import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

function JobDescription({ onHandleInputChange }: any) {

    return (
        <div className='border rounded-2xl p-10'>
            <div>
                <label className='font-medium'>Job Position</label>
                <Input placeholder='Ex. Packaging Worker'
                    onChange={(event) => onHandleInputChange('jobTitle', event.target.value)}
                />
            </div>
            <div className='mt-6'>
                <label className='font-medium'>Job Description / Requirements (Optional)</label>
                <Textarea placeholder='Ex. Packaging at large corporations'
                    className='h-[200px]'
                    onChange={(event) => onHandleInputChange('jobDescription', event.target.value)}
                />
            </div>


        </div>
    )
}

export default JobDescription
