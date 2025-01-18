'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div 
      className="container mx-auto py-12 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Mission Section */}
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Leetr was created with a simple goal: to help developers track and improve their 
                technical interview preparation journey. We believe in making the learning process 
                structured, measurable, and effective.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform combines intelligent problem tracking, spaced repetition, and 
                comprehensive solution management to help you master technical interviews.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Features Section */}
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                What Sets Us Apart
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Smart Progress Tracking',
                  description: 'Track your problem-solving journey with detailed insights and analytics.'
                },
                {
                  title: 'Spaced Repetition',
                  description: 'Review problems at optimal intervals to strengthen your understanding.'
                },
                {
                  title: 'Comprehensive Solutions',
                  description: 'Store and access your solutions with time and space complexity analysis.'
                },
                {
                  title: 'Community Driven',
                  description: 'Learn and grow with a community of like-minded developers.'
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-semibold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Meet the Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                {teamMembers.map((member, index) => (
                  <motion.div 
                    key={index} 
                    className="space-y-4 p-6 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="text-2xl font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="text-muted-foreground">{member.bio}</p>
                    <div className="flex space-x-4">
                      {Object.entries(member.links).map(([platform, url]) => (
                        <motion.div
                          key={platform}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Link 
                            href={url}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200"
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
} 