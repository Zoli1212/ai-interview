"use client"

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { syncUserToDatabase } from '@/lib/actions/user';

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            if (!isLoaded || !user || hasSynced.current) return;

            const email = user.primaryEmailAddress?.emailAddress;
            if (!email) return;

            hasSynced.current = true;

            try {
                const result = await syncUserToDatabase({
                    clerkId: user.id,
                    email,
                    name: user.fullName,
                    imageUrl: user.imageUrl,
                });

                if (!result.success) {
                    console.error('[UserSync] Failed to sync user:', result.error);
                }
            } catch (error) {
                console.error('[UserSync] Error syncing user:', error);
                hasSynced.current = false; // Reset on error so it can retry
            }
        };

        syncUser();
    }, [isLoaded, user]);

    return <>{children}</>;
}
