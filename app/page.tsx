import React from 'react';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Activity, Zap, Shield } from 'lucide-react';
import Link from 'next/link'

const LandingPage = () => {
  // Features data for the features section
  const features = [
    {
      title: "Real-time Analytics",
      description: "Get instant insights with our powerful analytics dashboard",
      icon: <Activity className="w-6 h-6 text-primary" />,
    },
    {
      title: "Lightning Fast",
      description: "Optimized performance for the smoothest user experience",
      icon: <Zap className="w-6 h-6 text-primary" />,
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade security to keep your data safe and protected",
      icon: <Shield className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">YourApp</div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-64">
                    <NavigationMenuLink className="cursor-pointer hover:bg-muted p-2 rounded">
                      Enterprise
                    </NavigationMenuLink>
                    <NavigationMenuLink className="cursor-pointer hover:bg-muted p-2 rounded">
                      Teams
                    </NavigationMenuLink>
                    <NavigationMenuLink className="cursor-pointer hover:bg-muted p-2 rounded">
                      Personal
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2">About</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2">Contact</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Transform the way you prep for your next interview
          </h1>
          <p className="text-lg text-muted-foreground">
            Streamline your interview prep with our platform and get the internship you deserve.
          </p>
          <div className="flex gap-4">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <img 
              src="https://assets.leetcode.com/users/images/e20369fa-bc1c-437c-b431-64a05c12c3f4_1683047706.313295.jpeg" 
              alt="Platform preview" 
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-lg text-muted-foreground">
              Experience the difference with our cutting-edge features
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
            <h3 className="text-2xl font-bold mb-8">Trusted by Industry Leaders</h3>
            <div className="flex flex-wrap justify-center gap-8">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="w-32 h-12 bg-muted rounded flex items-center justify-center">
                  Logo {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;