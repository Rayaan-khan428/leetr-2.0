'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const sections = [
    {
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          details: [
            "Name and email address when you create an account",
            "Profile information you choose to provide",
            "GitHub integration data (if you choose to connect)",
            "Communication preferences"
          ]
        },
        {
          subtitle: "Usage Data",
          details: [
            "Problem-solving progress and statistics",
            "Solution submissions and notes",
            "Study patterns and learning analytics",
            "Time spent on problems and review sessions",
            "Device information and IP address",
            "Browser type and settings"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          details: [
            "Personalize your learning experience",
            "Track and analyze your progress",
            "Provide spaced repetition recommendations",
            "Generate performance insights and statistics",
            "Enable community features and collaboration"
          ]
        },
        {
          subtitle: "Service Improvement",
          details: [
            "Analyze feature usage and effectiveness",
            "Improve our algorithms and recommendations",
            "Debug technical issues",
            "Develop new features and services"
          ]
        }
      ]
    },
    {
      title: "Data Storage and Security",
      content: [
        {
          subtitle: "Security Measures",
          details: [
            "Industry-standard encryption protocols",
            "Regular security audits and updates",
            "Secure database management",
            "Limited employee access to user data",
            "Regular backup procedures"
          ]
        },
        {
          subtitle: "Data Retention",
          details: [
            "Account data stored until deletion request",
            "Usage logs retained for 12 months",
            "Anonymized analytics data kept indefinitely"
          ]
        }
      ]
    },
    {
      title: "Your Rights and Choices",
      content: [
        {
          subtitle: "User Rights",
          details: [
            "Access your personal data",
            "Request data correction or deletion",
            "Export your data",
            "Opt-out of non-essential data collection",
            "Control email notifications and preferences"
          ]
        },
        {
          subtitle: "Account Control",
          details: [
            "Delete your account and associated data",
            "Modify profile information",
            "Manage GitHub integration settings",
            "Control privacy settings"
          ]
        }
      ]
    },
    {
      title: "Third-Party Services",
      content: [
        {
          subtitle: "Integrations",
          details: [
            "GitHub (for code synchronization)",
            "Analytics services",
            "Email service providers",
            "Cloud hosting providers"
          ]
        },
        {
          subtitle: "Data Sharing",
          details: [
            "No sale of personal information",
            "Limited sharing with service providers",
            "Anonymized data for analytics",
            "Legal compliance when required"
          ]
        }
      ]
    },
    {
      title: "Updates to Privacy Policy",
      content: [
        {
          subtitle: "Changes",
          details: [
            "Right to modify policy at any time",
            "Notice of significant changes via email",
            "Continued use implies acceptance",
            "Previous versions available upon request"
          ]
        }
      ]
    },
    {
      title: "Contact Information",
      content: [
        {
          subtitle: "Get in Touch",
          details: [
            "Email: emailemail@example.com",
            "Response within 48 hours",
            "Address privacy concerns or questions",
            "Request data-related actions"
          ]
        }
      ]
    }
  ]

  return (
    <motion.div 
      className="container mx-auto py-12 px-4 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <span className="text-sm font-medium text-primary/80 tracking-wider uppercase">
            Your Privacy Matters
          </span>
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We believe in transparency and protecting your data. Learn how we handle your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="grid gap-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all duration-300"
                onClick={() => setExpandedSection(expandedSection === section.title ? null : section.title)}
              >
                <CardHeader className="cursor-pointer select-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {section.title}
                    </CardTitle>
                    <motion.div
                      animate={{ rotate: expandedSection === section.title ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-6 w-6 text-primary/60" />
                    </motion.div>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedSection === section.title && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="space-y-6 pt-0">
                        {section.content.map((subsection) => (
                          <motion.div
                            key={subsection.subtitle}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3 p-4 rounded-lg bg-muted/30"
                          >
                            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                              {subsection.subtitle}
                            </h3>
                            <ul className="space-y-2 text-muted-foreground">
                              {subsection.details.map((detail, i) => (
                                <li 
                                  key={i} 
                                  className="flex items-start gap-2 ml-4"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-2"></span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 * sections.length }}
          className="text-center space-y-4 py-8"
        >
          <p className="text-lg text-muted-foreground">
            Have questions about our privacy practices?
          </p>
          <a 
            href="mailto:emailemail@example.com" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
          >
            Contact our Team
            <span className="text-lg">→</span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
} 