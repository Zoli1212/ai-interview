'use client'

import { Button } from '@/components/ui/button'
import { UserButton, useUser } from '@clerk/nextjs'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'

function Header() {
    const { user } = useUser()

    return (
        <nav className="flex w-full items-center justify-between border-b border-neutral-200 px-6 py-3 bg-white shadow-sm dark:border-neutral-800 dark:bg-black">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold">AI Interview Platform</h1>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link href="/dashboard">
                            <Button size="default">Dashboard</Button>
                        </Link>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10"
                                }
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Link href="/sign-in">
                            <Button variant="ghost" size="default">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="default">Start Interviewing</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Header
