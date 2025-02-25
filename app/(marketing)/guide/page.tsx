"use client";

import { motion } from "framer-motion";
import { IconBrain, IconRocket, IconTarget, IconTrophy, IconRepeat, IconMoodHappy } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

// First, let's define our types
interface ContentBlock {
  heading?: string;
  text?: string;
  type?: 'list' | 'tip';
  items?: string[];
}

interface Section {
  title: string;
  icon: JSX.Element;
  emoji: string;
  content: ContentBlock[];
}

export default function GuidePage() {
  const sections: Section[] = [
    {
      title: "The Zero to Hero Roadmap",
      icon: <IconRocket className="w-8 h-8 text-blue-500" />,
      emoji: "🚀",
      content: [
        {
          heading: "Real talk: grinding LeetCode randomly is like throwing spaghetti at the wall.",
          text: "Here's the actual roadmap that won't waste your time (trust, we've been there):"
        },
        {
          type: "list",
          items: [
            "Arrays & Strings - Yeah they're basic, but they're in literally every interview. Get good at these first.",
            "Two Pointers & Sliding Window - This is where you start feeling like you actually know what you're doing",
            "Trees & Graphs - The \"I actually understand DS&A now\" moment",
            "DP - The final boss. Don't touch this until you're comfortable with everything else"
          ]
        },
        {
          type: "tip",
          text: "Pro tip: Don't skip straight to mediums because some YouTuber told you to. Build. The. Foundation."
        }
      ]
    },
    {
      title: "The Leetr Advantage",
      icon: <IconTrophy className="w-8 h-8 text-blue-500" />,
      emoji: "💪",
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
      icon: <IconBrain className="w-8 h-8 text-blue-500" />,
      emoji: "🧠",
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
        },
        {
          type: "tip",
          text: "The system works. Your \"I'll review it later\" plan doesn't."
        }
      ]
    },
    {
      title: "Good Habits That Actually Work",
      icon: <IconTarget className="w-8 h-8 text-blue-500" />,
      emoji: "🎯",
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
        },
        {
          type: "tip",
          text: "Consistency > Grinding 8 hours the day before"
        }
      ]
    },
    {
      title: "The Review Process That Doesn't Suck",
      icon: <IconRepeat className="w-8 h-8 text-blue-500" />,
      emoji: "🔄",
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
        },
        {
          type: "tip",
          text: "Remember: That L2 at Google was grinding LeetCode just like you not too long ago"
        }
      ]
    },
    {
      title: "Keep It Fun (Yes, Really!)",
      icon: <IconMoodHappy className="w-8 h-8 text-blue-500" />,
      emoji: "😊",
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
        },
        {
          type: "tip",
          text: "For real though: The best grind is the one you can maintain without losing your sanity"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[370px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Effects - toned down opacity and colors */}
        <div className="absolute inset-0">
          <BackgroundGradientAnimation
            gradientBackgroundStart="hsl(var(--background))"
            gradientBackgroundEnd="hsl(var(--background))"
            firstColor="18, 113, 255"
            secondColor="221, 74, 255"
            thirdColor="100, 220, 255"
            fourthColor="200, 50, 50"
            fifthColor="180, 180, 50"
            pointerColor="140, 100, 255"
            size="100%"
            blendingValue="soft-light"
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-purple-600/90">
              The Ultimate LeetCode Guide
            </h1>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl text-muted-foreground/70">
                From "What is LeetCode?" to "I got the job!" —
              </p>
              <p className="text-xl text-foreground/80">
                Here's your roadmap to success.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative py-20 px-4 bg-gradient-to-b from-background/80 to-background">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="group relative overflow-hidden border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative">
                    <motion.div 
                      className="flex items-center gap-4"
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm group-hover:bg-primary/20 transition-colors duration-300">
                        {section.icon}
                      </div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                          {section.title}
                        </h2>
                        <motion.span 
                          className="text-2xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {section.emoji}
                        </motion.span>
                      </div>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative space-y-6">
                    {section.content.map((block, i) => {
                      if ('heading' in block) {
                        return (
                          <motion.div 
                            key={i}
                            className="space-y-3"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <p className="text-lg font-semibold text-foreground/90">
                              {block.heading}
                            </p>
                            {block.text && (
                              <p className="text-muted-foreground leading-relaxed">
                                {block.text}
                              </p>
                            )}
                          </motion.div>
                        );
                      }
                      
                      if (block.type === 'list' && block.items) {
                        return (
                          <ul key={i} className="space-y-4 pl-4">
                            {block.items.map((item, j) => (
                              <motion.li 
                                key={j}
                                className="flex items-start gap-3 group/item"
                                whileHover={{ x: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <span className="text-primary text-lg group-hover/item:scale-125 transition-all duration-300">
                                  •
                                </span>
                                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">
                                  {item}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        );
                      }
                      
                      if (block.type === 'tip') {
                        return (
                          <motion.div 
                            key={i}
                            className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
                            <p className="relative text-sm font-medium text-primary">
                              {block.text}
                            </p>
                          </motion.div>
                        );
                      }
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 