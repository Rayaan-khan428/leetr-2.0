import type { Metadata } from "next";
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationProvider } from "@/components/providers/NavigationProvider"
import Footer from "@/components/shared/navigation/Footer"
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

// Load Geist font families with their full weight ranges
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LeetTracker",
  description: "Track and improve your LeetCode problem-solving journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavigationProvider>
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </NavigationProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}