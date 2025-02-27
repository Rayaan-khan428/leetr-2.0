'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ImportedProblem {
  leetcodeId: string
  problemName: string
  difficulty: string
  timeComplexity?: string
  spaceComplexity?: string
  notes?: string
  solvedAt: string
}

export function ImportProblems({ onImportComplete }: { onImportComplete: () => void }) {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = async () => {
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = await getToken()
      const response = await fetch('/api/problems/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Import failed')

      const result = await response.json()
      
      toast({
        title: "Import complete",
        description: `Imported ${result.count} problems${result.skipped ? `, ${result.skipped} skipped (already exist)` : ''}${result.failed ? `, ${result.failed} failed` : ''}`
      })

      onImportComplete()
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check your file format and try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const solvedAtInput = formData.get('solvedAt') as string;
    
    // Parse date if provided, otherwise use current date
    let solvedAt = new Date().toISOString();
    if (solvedAtInput && solvedAtInput.trim() !== '') {
      try {
        // Parse MM-DD-YYYY format
        const [month, day, year] = solvedAtInput.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        
        if (!isNaN(date.getTime())) {
          solvedAt = date.toISOString();
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        // Continue with current date if parsing fails
      }
    }

    const problem: Partial<ImportedProblem> = {
      leetcodeId: `problem-${Date.now()}`,
      problemName: formData.get('problemName') as string,
      difficulty: formData.get('difficulty') as string,
      timeComplexity: formData.get('timeComplexity') as string,
      spaceComplexity: formData.get('spaceComplexity') as string,
      notes: formData.get('notes') as string,
      solvedAt
    }

    try {
      const token = await getToken()
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(problem)
      })

      if (response.status === 409) {
        // Handle duplicate problem
        toast({
          title: "Problem already exists",
          description: "You've already added this LeetCode problem to your history",
          variant: "warning"
        })
        return
      }

      if (!response.ok) throw new Error('Failed to add problem')

      toast({
        title: "Problem added",
        description: "Successfully added problem to your history"
      })

      onImportComplete()
    } catch (error) {
      toast({
        title: "Failed to add problem",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Import Problems
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Problems</DialogTitle>
          <DialogDescription>
            Import your LeetCode problems from a CSV file or add them manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="csv" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with columns: problemName, difficulty, timeComplexity (optional), spaceComplexity (optional), notes (optional), solvedAt (optional, format: MM-DD-YYYY)
                </p>
              </div>
              <Button 
                onClick={handleFileUpload} 
                disabled={!file || isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import from CSV
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty
                  </label>
                  <Select name="difficulty" required defaultValue="EASY">
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="problemName" className="text-sm font-medium">
                    Problem Name
                  </label>
                  <Input
                    id="problemName"
                    name="problemName"
                    placeholder="e.g., Two Sum"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="timeComplexity" className="text-sm font-medium">
                      Time Complexity
                    </label>
                    <Select name="timeComplexity">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O(1)">O(1)</SelectItem>
                        <SelectItem value="O(log n)">O(log n)</SelectItem>
                        <SelectItem value="O(n)">O(n)</SelectItem>
                        <SelectItem value="O(n log n)">O(n log n)</SelectItem>
                        <SelectItem value="O(n²)">O(n²)</SelectItem>
                        <SelectItem value="O(2^n)">O(2^n)</SelectItem>
                        <SelectItem value="O(n!)">O(n!)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="spaceComplexity" className="text-sm font-medium">
                      Space Complexity
                    </label>
                    <Select name="spaceComplexity">
                      <SelectTrigger>
                        <SelectValue placeholder="Select space complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O(1)">O(1)</SelectItem>
                        <SelectItem value="O(log n)">O(log n)</SelectItem>
                        <SelectItem value="O(n)">O(n)</SelectItem>
                        <SelectItem value="O(n log n)">O(n log n)</SelectItem>
                        <SelectItem value="O(n²)">O(n²)</SelectItem>
                        <SelectItem value="O(2^n)">O(2^n)</SelectItem>
                        <SelectItem value="O(n!)">O(n!)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="solvedAt" className="text-sm font-medium">
                    Date Solved (MM-DD-YYYY)
                  </label>
                  <Input
                    id="solvedAt"
                    name="solvedAt"
                    placeholder="e.g., 02-15-2024"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use current date
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Any notes about your solution"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Problem
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 