import { UserButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { GraduationCap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MenuOption = [
    {
        name: 'Dashboard',
        path: '/dashboard'
    },
    {
        name: 'My Sessions',
        path: '/dashboard'
    },
    {
        name: 'Help',
        path: '/help'
    }
]

function AppHeader() {
    return (
        <nav className="flex w-full items-center justify-between border-b border-neutral-200 px-6 py-3 bg-white shadow-sm dark:border-neutral-800 dark:bg-black">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold hidden md:block">Agent Teacher</h1>
            </Link>
            
            <div className="flex items-center gap-6">
                <ul className='hidden md:flex gap-6'>
                    {MenuOption.map((option, index) => (
                        <Link href={option.path} key={index}>
                            <li className='text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer'>
                                {option.name}
                            </li>
                        </Link>
                    ))}
                </ul>

                <SignOutButton redirectUrl="/">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </SignOutButton>

                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-10 h-10"
                        }
                    }}
                />
            </div>
        </nav>
    )
}

export default AppHeader
