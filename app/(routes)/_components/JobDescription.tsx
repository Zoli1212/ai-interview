import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

function JobDescription({ onHandleInputChange }: any) {

    return (
        <div className='border rounded-2xl p-10'>
            <div>
                <label>Topic/Subject</label>
                <Input placeholder='Ex. JavaScript Fundamentals, Biology Chapter 5'
                    onChange={(event) => onHandleInputChange('jobTitle', event.target.value)}
                />
            </div>
            <div className='mt-6'>
                <label>Additional Context (Optional)</label>
                <Textarea placeholder='Enter any specific topics or areas you want to focus on'
                    className='h-[200px]'
                    onChange={(event) => onHandleInputChange('jobDescription', event.target.value)}
                />
            </div>


        </div>
    )
}

export default JobDescription
