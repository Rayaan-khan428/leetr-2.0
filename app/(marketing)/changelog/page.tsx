"use client";

import { motion } from "framer-motion";

interface Release {
  version: string;
  date: string;
  changes: {
    type: "feature" | "fix" | "improvement";
    description: string;
  }[];
}

const releases: Release[] = [
  {
    version: "1.0.0",
    date: "Coming Soon",
    changes: [
      {
        type: "feature",
        description: "Challenge requests system for competitive practice",
      },
      {
        type: "feature",
        description: "Interview preparation blog with strategies and tips",
      },
      {
        type: "feature",
        description: "Interview series with experienced Software Engineers from top companies",
      },
      {
        type: "improvement",
        description: "Enhanced community features and social interactions",
      },
    ],
  },
  {
    version: "0.9.0-beta",
    date: "2024-02-13",
    changes: [
      {
        type: "feature",
        description: "Chrome extension for automatic LeetCode progress tracking",
      },
      {
        type: "feature",
        description: "Friend system with leaderboards",
      },
      {
        type: "feature",
        description: "Spaced repetition system for optimized problem review scheduling",
      },
      {
        type: "feature",
        description: "Automatic NeetCode video solution linking",
      },
      {
        type: "feature",
        description: "OAuth authentication with Google and GitHub",
      },
      {
        type: "feature",
        description: "System-wide dark mode with smooth transitions",
      },
      {
        type: "feature",
        description: "SMS notifications with customizable review reminders",
      },
      {
        type: "feature",
        description: "One-click spreadsheet importing for existing solutions",
      },
      {
        type: "improvement",
        description: "Comprehensive progress tracking with time & space complexity analysis",
      },
      {
        type: "improvement",
        description: "Advanced analytics dashboard with problem-solving patterns",
      },
      {
        type: "improvement",
        description: "Modern UI with responsive design and smooth animations",
      },
    ],
  },
  {
    version: "0.8.0-alpha",
    date: "2024-02-05",
    changes: [
      {
        type: "feature",
        description: "Initial project setup and architecture",
      },
      {
        type: "feature",
        description: "Basic authentication system implementation",
      },
      {
        type: "feature",
        description: "Core dashboard layout and navigation",
      },
      {
        type: "improvement",
        description: "Set up development and deployment pipeline",
      },
      {
        type: "improvement",
        description: "Initial database schema and API endpoints",
      },
    ],
  },
];

const getBadgeColor = (type: Release["changes"][0]["type"]) => {
  switch (type) {
    case "feature":
      return "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20";
    case "fix":
      return "bg-red-500/10 text-red-500 ring-red-500/20";
    case "improvement":
      return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 ring-gray-500/20";
  }
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Changelog
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Keep track of what's new in Leetr
        </p>

        <div className="space-y-12">
          {releases.map((release) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="flex items-baseline mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {release.version}
                </h2>
                <span className="ml-4 text-sm text-muted-foreground">
                  {typeof release.date === 'string' && release.date === 'Coming Soon' 
                    ? release.date 
                    : new Date(release.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                  }
                </span>
              </div>

              <div className="space-y-4">
                {release.changes.map((change, idx) => (
                  <div key={idx} className="flex items-start">
                    <span 
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset mr-3 ${getBadgeColor(change.type)}`}
                    >
                      {change.type}
                    </span>
                    <p className="text-muted-foreground mt-0.5">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 