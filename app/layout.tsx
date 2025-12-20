import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";




export const metadata: Metadata = {
  title: "Agent Teacher - AI Learning Assistant",
  description: "Learn with AI-powered teacher that asks questions based on your study materials",
};

const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body
          className={outfit.className}
        >
            {children}
            <Toaster />
       
        </body>
      </html>
    </ClerkProvider>
  );
}
