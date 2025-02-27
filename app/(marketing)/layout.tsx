import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navigation/Navbar";
import { Footer } from "@/components/shared/navigation/Footer";

export const metadata: Metadata = {
  title: "Leetr",
  description: "Track and improve your LeetCode problem-solving journey",
};

export default function MarketingLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    );
  }