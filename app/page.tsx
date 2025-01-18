"use client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";
import { IconBrain, IconCode, IconGraph, IconLayoutGrid, IconRobot, IconTarget, IconTrophy } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <LampContainer className="h-[90vh]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center -mt-32"
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-center">
              Ace Your Technical <br></br>Interviews with Confidence
            </h1>
            <p className="text-xl text-gray-200 max-w-xl mt-8 mb-12 text-center leading-relaxed">
              Master data structures, algorithms, and problem-solving with 
              AI-powered practice and real-time feedback.
            </p>
            <ShimmerButton>
              <Link href="/dashboard" className="px-12 py-4">
                Start Practicing Free
              </Link>
            </ShimmerButton>
          </motion.div>
        </LampContainer>
      </section>

      {/* How it Works Section */}
      <section className="relative py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your journey to interview success, simplified and personalized
            </p>
          </div>
          
          <StickyScroll 
            contentClassName="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/20 backdrop-blur-sm"
            content={[
              {
                title: "AI-Powered Problem Analysis",
                description: "Our advanced AI analyzes your coding patterns, identifies knowledge gaps, and creates a personalized learning path tailored to your needs.",
                content: (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconBrain className="w-24 h-24 text-blue-400" />
                  </div>
                ),
              },
              {
                title: "Interactive Learning Experience",
                description: "Practice with real interview questions while receiving real-time feedback and hints to guide you toward optimal solutions.",
                content: (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconCode className="w-24 h-24 text-indigo-400" />
                  </div>
                ),
              },
              {
                title: "Progress Tracking & Analytics",
                description: "Track your improvement over time with detailed performance metrics and identify areas that need more focus.",
                content: (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconGraph className="w-24 h-24 text-cyan-400" />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A comprehensive platform designed to transform you into a confident problem solver
            </p>
          </div>
          
          <BentoGrid className="max-w-5xl mx-auto">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={cn(
                  "transition-all duration-500 hover:scale-[1.02] hover:shadow-xl",
                  i === 3 || i === 6 ? "md:col-span-2" : "",
                  "bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 backdrop-blur-sm"
                )}
              />
            ))}
          </BentoGrid>
        </div>
      </section>
    </main>
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl 
                  bg-gradient-to-br from-gray-800 to-gray-900 
                  transition-all duration-300"></div>
);

const items = [
  {
    title: "AI-Powered Learning",
    description: "Smart problem recommendations tailored to your skill level and goals.",
    header: <Skeleton />,
    icon: <IconRobot className="h-5 w-5 text-blue-500" />,
  },
  {
    title: "Progress Analytics",
    description: "Deep insights into your problem-solving patterns and growth areas.",
    header: <Skeleton />,
    icon: <IconGraph className="h-5 w-5 text-indigo-500" />,
  },
  {
    title: "Pattern Recognition",
    description: "Master common patterns across different problem types.",
    header: <Skeleton />,
    icon: <IconBrain className="h-5 w-5 text-purple-500" />,
  },
  {
    title: "Structured Learning Path",
    description: "Follow a carefully designed roadmap from fundamentals to advanced concepts.",
    header: <Skeleton />,
    icon: <IconLayoutGrid className="h-5 w-5 text-blue-500" />,
  },
  {
    title: "Achievement System",
    description: "Stay motivated with badges and milestone tracking.",
    header: <Skeleton />,
    icon: <IconTrophy className="h-5 w-5 text-yellow-500" />,
  },
  {
    title: "Targeted Practice",
    description: "Focus on company-specific questions and topics.",
    header: <Skeleton />,
    icon: <IconTarget className="h-5 w-5 text-red-500" />,
  },
  {
    title: "Code Templates",
    description: "Ready-to-use templates for common algorithms and patterns.",
    header: <Skeleton />,
    icon: <IconCode className="h-5 w-5 text-green-500" />,
  },
];