"use server"

import { prisma } from '@/lib/prisma';

export async function syncUserToDatabase(userData: {
    clerkId: string;
    email: string;
    name?: string | null;
    imageUrl?: string | null;
}) {
    try {
        const { clerkId, email, name, imageUrl } = userData;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (existingUser) {
            // User already exists, update fields
            const updatedUser = await prisma.user.update({
                where: { clerkId },
                data: {
                    email,
                    name,
                    imageUrl,
                    updatedAt: new Date(),
                },
            });

            console.log('[UserSync] User updated:', updatedUser.id);
            return { success: true, user: updatedUser, action: 'updated' };
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                clerkId,
                email,
                name,
                imageUrl,
            },
        });

        console.log('[UserSync] User created:', newUser.id);
        return { success: true, user: newUser, action: 'created' };
    } catch (error: any) {
        console.error('[UserSync] Error:', error);
        return { success: false, error: error.message };
    }
}
