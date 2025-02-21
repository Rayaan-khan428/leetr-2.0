"use client";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";
import { IconBrain, IconCode, IconGraph, IconLayoutGrid, IconRobot, IconTarget, IconTrophy } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FC } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

interface Step {
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    title: "Spaced Repetition That Works",
    description: "Our algorithm knows when you're about to forget that tricky DP solution. Get smart SMS reminders that you'll actually want to check (no more notification graveyard) 🧠",
    icon: <IconRobot className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "NeetCode Solutions, Automatically",
    description: "Stuck on a problem? We automatically link NeetCode's solution videos right where you need them. Because sometimes you need to see how it's done 📚",
    icon: <IconCode className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Ditch The Spreadsheet Life",
    description: "Let's be honest - that Google Sheet isn't cutting it anymore. Our extension tracks everything: solutions, time complexity, patterns. Future you will be grateful 📈",
    icon: <IconGraph className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "SMS Reminders That Hit Different",
    description: "From \"Who's gonna carry the boats?\" to \"Time to crush another medium\" - choose notifications that actually motivate you to keep grinding 💪",
    icon: <IconBrain className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Import Your Progress",
    description: "Already grinding with a spreadsheet? We'll import all your problems, solutions, and notes in one click. Keep your progress, lose the hassle 🚀",
    icon: <IconLayoutGrid className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Level Up Together",
    description: "Add your study group and track who's putting in work. Nothing beats some friendly competition to keep the momentum going 🏆",
    icon: <IconTarget className="w-6 h-6 text-blue-500" />,
  },
];

const steps: Step[] = [
  {
    title: "Download the Leetr Chrome Extension",
    description: "This is your way to easily document your solution, no more spreadsheets!",
  },
  {
    title: "Use the Leetr Dashboard",
    description: "You can view the information in the Leetr Dashboard, quickly see your progress and notes you took.",
  },
  {
    title: "Compete with your friends",
    description: "Add friends and compete with them to see who the most cracked one amongst you is.",
  },
];

const HeroButton: FC = () => {
  return (
    <div className="flex justify-center gap-4">
      <Link href="/guide">
        <ShimmerButton 
          className="rounded-lg px-8 py-6 text-base min-w-[200px]"
        >
          LeetCode Guide
        </ShimmerButton>
      </Link>
      <Link href="/login">
        <ShimmerButton 
          className="rounded-lg px-8 py-6 text-base min-w-[200px] flex items-center justify-center"
        >
          Get Started
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
            className="ml-2"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </ShimmerButton>
      </Link>
    </div>
  );
};

const Hero: FC = () => {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 pt-16 sm:pt-20 pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,118,255,0.1),transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="container px-4 mx-auto relative z-10 pt-10 sm:pt-12"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
           Conquer Your Next<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500">
              Coding Interview
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            A platform that helps make prepping for tech interviews easier.
          </p>
          <HeroButton />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">interview_prep.ts</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 p-6">
            <pre className="text-sm text-gray-700 dark:text-gray-300">
              <code>{`async function getTopTechJob(): Promise<string> {
  // Step 1: Practice with Leetr
  const developer = await Developer.create({
    motivation: 100,
    coffeeLevel: "high",
    dreams: ["FAANG", "unicorn_startup"]
  });

  // Step 2: Solve problems consistently
  while (developer.status !== "interview_ready") {
    await developer.practice({
      platform: "Leetr",
      mode: "PRACTICE",
      difficulty: "adaptive"
    });
    
    developer.skills++;
    developer.confidence += 2;
  }

  // Step 3: Crush the interviews
  const offers = await developer.applyTo([
    "Google",
    "Meta",
    "Amazon",
    "Netflix"
  ]);

  return offers.getBestOffer(); // 🚀 Your dream job awaits!
}`}</code>
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const Features: FC = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black bg-grid-black/[0.1] dark:bg-grid-white/[0.1]">
      {/* Radial gradient overlay - using blue tint instead of pure white/black */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,118,255,0.05),transparent_50%)]" />
      
      {/* Mask gradient */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            A comprehensive platform designed for interview preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks: FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            How it works
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            Start improving your interview skills in three simple steps
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Vertical cards */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right side - Video */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
          >
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              controlsList="nodownload"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Optional: Keep the gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTA: FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to ace your next interview?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Join thousands of developers who have already improved their interview skills
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <ShimmerButton className="rounded-lg px-8 py-6 text-base">
                Get Started
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
                  className="ml-2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home: FC = () => {
  return (
    <main className="bg-white dark:bg-black text-gray-900 dark:text-white">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  );
};

export default Home;