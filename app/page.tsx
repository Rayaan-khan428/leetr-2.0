import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Book, Timer, Brain, Users } from 'lucide-react';
import Image from 'next/image'

const LandingPage = () => {
  const features = [
    {
      title: "Practice Smart",
      description: "proprietary algorithm determines which questions to practice based on your skill level and learning pace",
      icon: <Brain className="w-6 h-6 text-primary" />,
    },
    {
      title: "Friends Leaderboard",
      description: "Compete with your friends to see who's the best at solving problems",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      title: "Expert Solutions",
      description: "Neetcode solutions to all Leetcode problems at the click of a button",
      icon: <Book className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Just Launched</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Ace Your Technical Interviews with Confidence
          </h1>
          <p className="text-lg text-muted-foreground">
            Built by engineers who&apos;ve shared the struggle of preparing for interviews.
          </p>
          <div className="flex gap-4">
            <Button size="lg">
              Start Documenting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>Completely Free</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Compete with your friends (coming soon)</span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Image
            src="/images/interview-prep.png"
            alt="Interview preparation illustration"
            width={500}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
            priority
          />
        </div>
      </section>

      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What we offer?</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to succeed in your technical interviews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">What our users say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "Uncle Kash Son",
                  role: "Amazon assembly line",
                  text: "This platform helped me structure my interview preparation effectively, and I got a job at Amazon (albeit at a lower level than I wanted)",
                  company: "Amazon"
                },
                {
                  name: "Mr. Shah",
                  role: "Equity Research Analyst",
                  text: "The expert solutions helped me understand complex problems better. I successfully landed my dream job!",
                  company: "Blackrock"
                },
                {
                  name: "Ayan Khan",
                  role: "Software Engineer",
                  text: "I don’t have dreams. I have goals. And while you’re busy making excuses, I’m busy getting better.",
                  company: "Hitachi"    
                },
                {
                  name: "Rayaan Khan",
                  role: "Senior Software Engineer at Amazon",
                  text: "I built this platform to help my friends and I get jobs at FAANG companies. I'm glad to see it's helping others too!",
                  company: "Scotiabank"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="text-left">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">&quot;{testimonial.text}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;