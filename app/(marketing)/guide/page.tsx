"use client";

import { motion } from "framer-motion";
import { IconBrain, IconRocket, IconTarget, IconTrophy, IconRepeat, IconMoodHappy } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ContentBlock {
  heading?: string;
  text?: string;
  type?: 'list' | 'tip';
  items?: string[];
}

interface Section {
  title: string;
  icon: JSX.Element;
  content: ContentBlock[];
}

export default function GuidePage() {
  const sections: Section[] = [
    {
      title: "The Zero to Hero Roadmap",
      icon: <IconRocket className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: "Real talk: grinding LeetCode randomly is like throwing spaghetti at the wall.",
          text: "Here's the actual roadmap that won't waste your time:"
        },
        {
          type: "list",
          items: [
            "Arrays & Strings - Yeah they're basic, but they're in literally every interview. Get good at these first.",
            "Two Pointers & Sliding Window - This is where you start feeling like you actually know what you're doing",
            "Trees & Graphs - The \"I actually understand DS&A now\" moment",
            "DP - The final boss. Don't touch this until you're comfortable with everything else"
          ]
        }
      ]
    },
    {
      title: "The Leetr Advantage",
      icon: <IconTrophy className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: "Look, we've all been there with the messy Google Sheets tracking system.",
          text: "Here's how Leetr actually makes your life easier:"
        },
        {
          type: "list",
          items: [
            "Chrome extension that just works™️ (no more manual tracking)",
            "Spaced repetition that's actually based on science, not vibes",
            "NeetCode solutions auto-linked (because sometimes you just need to see it explained)",
            "SMS reminders that hit different than those notifications you always ignore",
            "Spreadsheet importing because we know you've got that one sheet with 100+ problems"
          ]
        }
      ]
    },
    {
      title: "Spaced Repetition: Your Secret Weapon",
      icon: <IconBrain className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: '"I\'ll definitely remember this solution forever!" - Everyone, right before bombing their Google interview',
          text: "Here's the thing about your brain: it's lazy. It wants to forget these solutions. Our spaced repetition schedule is built to fight exactly that:"
        },
        {
          type: "list",
          items: [
            "Day 1: Solve it (the honeymoon phase)",
            "Day 3: First review (when you realize you forgot half of it)",
            "Day 7: Getting serious (okay, now it's sticking)",
            "Day 14: Flex time (you can explain it to others)",
            "Day 30: Big brain time (you could solve this in your sleep)"
          ]
        }
      ]
    },
    {
      title: "Good Habits That Actually Work",
      icon: <IconTarget className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: "POV: You've got 3 months until your FAANG interviews.",
          text: "Here's your game plan:"
        },
        {
          type: "list",
          items: [
            "One problem a day minimum (yes, even on weekends - especially on weekends)",
            "Time yourself but don't sweat it (nobody asked Dijkstra to solve it in 20 minutes)",
            "Document your approach (future you will worship present you for this)",
            "No solution peeking for 25 mins (build that problem-solving muscle)",
            "Actually understand the solution (not just \"yeah this makes sense\")",
            "Code it yourself (ctrl+c ctrl+v won't help in the interview)",
            "Review when Leetr tells you to (trust the process)"
          ]
        }
      ]
    },
    {
      title: "The Review Process That Doesn't Suck",
      icon: <IconRepeat className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: "When that review notification hits (we got you), here's the move:",
          text: ""
        },
        {
          type: "list",
          items: [
            "Close the solution tab. Yes, really. Try it from memory",
            "Stuck? Quick peek at your notes (this is why we write them)",
            "Rate your recall honestly (no one's judging)",
            "The algorithm adapts to your ratings (it's like Netflix but for your brain)",
            "Small wins = big gains (solved it faster? W)"
          ]
        }
      ]
    },
    {
      title: "Keep It Fun (Yes, Really!)",
      icon: <IconMoodHappy className="w-6 h-6 text-blue-500" />,
      content: [
        {
          heading: "Hot take: LeetCode doesn't have to make you want to quit CS",
          text: ""
        },
        {
          type: "list",
          items: [
            "Get your friends on here (nothing like some healthy competition)",
            "Set actual achievable goals (2 mediums/day isn't sustainable my guy)",
            "Watch those stats climb (dopamine hit different)",
            "First hard problem? Time to treat yourself",
            "Join the community (misery loves company jk)"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              The Ultimate LeetCode Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              From "What is LeetCode?" to "I got the job!" — Here's your roadmap to success.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {section.content.map((block, i) => (
                    <div key={i}>
                      {block.heading && (
                        <p className="text-lg font-medium mb-2">
                          {block.heading}
                        </p>
                      )}
                      {block.text && (
                        <p className="text-muted-foreground">
                          {block.text}
                        </p>
                      )}
                      {block.type === 'list' && block.items && (
                        <ul className="space-y-3 mt-4">
                          {block.items.map((item, j) => (
                            <li key={j} className="flex gap-3">
                              <span className="text-blue-500">•</span>
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {block.type === 'tip' && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {block.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 