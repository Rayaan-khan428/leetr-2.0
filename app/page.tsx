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
      {/* Mobile Hero Section */}
      <section className="sm:hidden relative w-full min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-50" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 mx-auto"
        >
          <h1 className="text-3xl font-bold tracking-tight text-center leading-[1.15] max-w-xs">
            Level Up Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
              Coding Interview
            </span>{' '}
            Game
          </h1>
          <p className="text-base text-gray-300 max-w-md mt-6 mb-8 text-center leading-relaxed px-4">
            AI-powered practice platform to help you master coding interviews with confidence.
          </p>
          <ShimmerButton className="scale-90">
            <Link href="/dashboard" className="px-8 py-3 text-sm inline-flex items-center gap-2">
              Start Free Practice
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </ShimmerButton>
        </motion.div>
      </section>

      {/* Desktop Hero Section with Lamp */}
      <section className="hidden sm:block relative w-full">
        <LampContainer className="h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="flex flex-col items-center justify-center -mt-16 max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center leading-[1.15]">
              Level Up Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                Coding Interview
              </span>{' '}
              Game
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-md mt-8 mb-12 text-center leading-relaxed">
              AI-powered practice platform to help you master coding interviews with confidence.
            </p>
            <ShimmerButton>
              <Link href="/dashboard" className="px-12 py-4 text-base inline-flex items-center gap-2">
                Start Free Practice
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </ShimmerButton>
          </motion.div>
        </LampContainer>
      </section>

      {/* How it Works Section */}
      <section className="relative py-12 sm:py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Your journey to interview success, simplified and personalized
            </p>
          </div>
          
          <div className="hidden sm:block">
            <StickyScroll 
              contentClassName="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/20 backdrop-blur-sm"
              content={[
                {
                  title: "AI-Powered Problem Analysis",
                  description: "Our advanced AI analyzes your coding patterns, identifies knowledge gaps, and creates a personalized learning path tailored to your needs.",
                  content: (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconBrain className="w-16 sm:w-24 h-16 sm:h-24 text-blue-400" />
                    </div>
                  ),
                },
                {
                  title: "Interactive Learning Experience",
                  description: "Practice with real interview questions while receiving real-time feedback and hints to guide you toward optimal solutions.",
                  content: (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconCode className="w-16 sm:w-24 h-16 sm:h-24 text-indigo-400" />
                    </div>
                  ),
                },
                {
                  title: "Progress Tracking & Analytics",
                  description: "Track your improvement over time with detailed performance metrics and identify areas that need more focus.",
                  content: (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconGraph className="w-16 sm:w-24 h-16 sm:h-24 text-cyan-400" />
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Mobile version of How it Works */}
          <div className="sm:hidden space-y-8">
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/20 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                <IconBrain className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">AI-Powered Problem Analysis</h3>
              <p className="text-gray-400 text-center">
                Our advanced AI analyzes your coding patterns, identifies knowledge gaps, and creates a personalized learning path tailored to your needs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/20 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                <IconCode className="w-16 h-16 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Interactive Learning Experience</h3>
              <p className="text-gray-400 text-center">
                Practice with real interview questions while receiving real-time feedback and hints to guide you toward optimal solutions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/20 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex justify-center mb-4">
                <IconGraph className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Progress Tracking & Analytics</h3>
              <p className="text-gray-400 text-center">
                Track your improvement over time with detailed performance metrics and identify areas that need more focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative py-16 sm:py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-4 sm:mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
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
    icon: <IconRobot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
  },
  {
    title: "Progress Analytics",
    description: "Deep insights into your problem-solving patterns and growth areas.",
    header: <Skeleton />,
    icon: <IconGraph className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />,
  },
  {
    title: "Pattern Recognition",
    description: "Master common patterns across different problem types.",
    header: <Skeleton />,
    icon: <IconBrain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />,
  },
  {
    title: "Structured Learning Path",
    description: "Follow a carefully designed roadmap from fundamentals to advanced concepts.",
    header: <Skeleton />,
    icon: <IconLayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
  },
  {
    title: "Achievement System",
    description: "Stay motivated with badges and milestone tracking.",
    header: <Skeleton />,
    icon: <IconTrophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />,
  },
  {
    title: "Targeted Practice",
    description: "Focus on company-specific questions and topics.",
    header: <Skeleton />,
    icon: <IconTarget className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
  },
  {
    title: "Code Templates",
    description: "Ready-to-use templates for common algorithms and patterns.",
    header: <Skeleton />,
    icon: <IconCode className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
  },
];