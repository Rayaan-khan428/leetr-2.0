import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Calendar, Code2, FileText, GitGraph, LineChart, Users } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">How It Works</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to make the most of LeetR to enhance your LeetCode practice and track your progress.
        </p>
      </div>

      <div className="space-y-12">
        {/* Problem Tracking Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Problem Tracking</h2>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>
                LeetR automatically tracks your LeetCode problem-solving journey. Each time you solve a problem, we record:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Problem details (name, difficulty, URL)</li>
                <li>Your solution and notes</li>
                <li>Time and space complexity</li>
                <li>Number of attempts</li>
                <li>Your personal difficulty rating</li>
                <li>Problem categories and tags</li>
              </ul>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold">Confidence Score System</h3>
                <p>
                  Each problem gets a confidence score based on your difficulty rating (out of 10) and the number of attempts needed to solve it.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-mono text-sm">
                    Confidence Score = 10 - difficulty rating - (attempts - 1)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-green-500 font-semibold mb-2">High Confidence (≥7)</div>
                    <p className="text-sm text-muted-foreground">Problems you've mastered and can solve confidently</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-yellow-500 font-semibold mb-2">Medium Confidence (4-6)</div>
                    <p className="text-sm text-muted-foreground">Problems you understand but might need review</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-red-500 font-semibold mb-2">Low Confidence (≤3)</div>
                    <p className="text-sm text-muted-foreground">Problems that need more practice and attention</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spaced Repetition Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Spaced Repetition System</h2>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <p className="text-lg">
                LeetR uses a spaced repetition system to help you retain problem-solving patterns and concepts over time.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">How Reviews Work</h3>
                <ul className="list-disc pl-6 space-y-3">
                  <li>Problems are scheduled for review based on your confidence score and previous review history</li>
                  <li>More challenging problems (lower confidence) are reviewed more frequently</li>
                  <li>As you successfully review problems, the intervals between reviews increase</li>
                  <li>The system adapts to your learning pace and problem difficulty</li>
                </ul>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mt-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p>
                    Check your Review Schedule daily to see which problems need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Social Features Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Social Features</h2>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <p className="text-lg">
                Stay motivated and learn from others with our social features.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Connect & Compare</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Connect with other LeetCode users</li>
                    <li>See what problems your friends are solving</li>
                    <li>Compare progress and maintain healthy competition</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Learn Together</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Get notifications when friends solve problems</li>
                    <li>Share and discuss different approaches</li>
                    <li>Build a supportive learning community</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mt-4">
                <LineChart className="h-5 w-5 text-primary" />
                <p>
                  Track your progress relative to your peers and stay motivated in your coding journey
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Browser Extension Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GitGraph className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Browser Extension</h2>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <p className="text-lg">
                Our browser extension seamlessly integrates with LeetCode to enhance your practice.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Automatically track solved problems</li>
                    <li>Add notes and difficulty ratings right from LeetCode</li>
                    <li>Quick access to your solution history</li>
                    <li>See confidence scores and review dates while browsing</li>
                    <li>Get notifications for problems due for review</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Getting Started</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Install the LeetR extension from the Chrome Web Store</li>
                    <li>Sign in with your LeetR account</li>
                    <li>Start solving problems on LeetCode</li>
                    <li>The extension will automatically track your progress</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mt-4">
                <FileText className="h-5 w-5 text-primary" />
                <p>
                  The extension works automatically - just solve problems as usual, and we'll handle the rest
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 