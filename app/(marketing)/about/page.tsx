'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconBrain, IconCode, IconRocket } from '@tabler/icons-react'

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Rayaan Khan',
      role: 'Founder & Lead Developer',
      bio: 'Software engineer passionate about helping others succeed in technical interviews.',
      links: {
        github: 'https://github.com/Rayaan-khan428',
        linkedin: 'https://linkedin.com/in/rayaankhan',
        email: 'mailto:rayaan1516@gmail.com'
      }
    },
    {
      name: 'Umar Rasool',
      role: 'Co-Founder & Developer',
      bio: 'Software engineer excited about bringing social interactions to the learning process.',
      links: {
        github: 'https://github.com/umarrasool15',
        linkedin: 'https://linkedin.com/in/umarrasool',
        email: 'mailto:umarrasool15@gmail.com'
      }
    }
  ]

  const milestones = [
    {
      title: "The Hackathon",
      description: "Started as a rough prototype at Hack Western 2023. We built a basic Chrome extension that could track LeetCode solutions - it barely worked, but the idea stuck.",
      icon: <IconCode className="w-6 h-6 text-blue-500" />,
      link: {
        text: "View Original Devpost",
        url: "https://devpost.com/software/leetr"
      }
    },
    {
      title: "The Realization",
      description: "During our internship hunts, we discovered just how crucial LeetCode was. Our old spreadsheets weren't cutting it, and we remembered our hackathon project.",
      icon: <IconBrain className="w-6 h-6 text-blue-500" />
    },
    {
      title: "The Rebuild",
      description: "We dusted off the code, completely rebuilt it from scratch, and turned it into what Leetr is today - a proper tool for serious technical interview prep.",
      icon: <IconRocket className="w-6 h-6 text-blue-500" />
    }
  ]

  return (
    <div className="container mx-auto py-32 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Origin Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            From a sleep-deprived hackathon project to a tool that's helping developers master technical interviews.
          </p>
        </motion.div>

        {/* Journey Timeline */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex gap-6 items-start"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {milestone.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {milestone.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {milestone.description}
                </p>
                {milestone.link && (
                  <Link 
                    href={milestone.link.url}
                    target="_blank"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium mt-2"
                  >
                    {milestone.link.text}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-8 rounded-2xl border border-blue-100 dark:border-blue-900"
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Built By Students, For Students
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            As students who've gone through the grind ourselves, we know exactly what it's like. 
            The endless LeetCode problems, the messy spreadsheets, the forgotten solutions - we've been there. 
            That's why we built Leetr: to help every CS student get cracked at technical interviews, 
            regardless of their background or experience. No fancy AI, no complicated systems - 
            just the tools you actually need to track your progress and crush your interviews.
          </p>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Meet the Team
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-blue-500 font-medium mt-1">{member.role}</p>
                <p className="text-muted-foreground mt-3">{member.bio}</p>
                <div className="flex space-x-4 mt-4">
                  {Object.entries(member.links).map(([platform, url]) => (
                    <motion.div
                      key={platform}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Link 
                        href={url}
                        className="text-muted-foreground hover:text-blue-500 transition-colors duration-200"
                        target="_blank"
                      >
                        {platform === 'github' && <Github className="h-5 w-5" />}
                        {platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                        {platform === 'email' && <Mail className="h-5 w-5" />}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 