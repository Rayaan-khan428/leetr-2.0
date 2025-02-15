import type { Metadata } from "next";
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/shared/navigation/Footer"
import { TypeformWidget } from "@/components/shared/TypeformWidget"
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

// Load Geist font families with their full weight ranges
const geistSans = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: [
    {
      path: './fonts/GeistMonoVF.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "LeetTracker",
  description: "Track and improve your LeetCode problem-solving journey",
};

// app/layout.tsx (Root Layout)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <TypeformWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}