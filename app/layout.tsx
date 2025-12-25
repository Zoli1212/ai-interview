import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";
import { UserSyncProvider } from "@/components/providers/UserSyncProvider";

export const metadata: Metadata = {
  title: "AI Interview Platform - Company Knowledge-Based Interviews",
  description:
    "Conduct AI-powered interviews using your company knowledge base for natural, insightful candidate assessments",
};

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={outfit.className}>
          <UserSyncProvider>
            {children}
            <Toaster />
          </UserSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
