'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ProblemFormProps {
  onSuccess?: () => void
}

export default function ProblemForm({ onSuccess }: ProblemFormProps) {
  const [formData, setFormData] = useState({
    leetcodeId: '',
    problemName: '',
    difficulty: '',
    solution: '',
    notes: '',
    timeComplexity: '',
    spaceComplexity: '',
    url: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = await getToken()
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit problem')
      }

      // Reset form and call success callback
      setFormData({
        leetcodeId: '',
        problemName: '',
        difficulty: '',
        solution: '',
        notes: '',
        timeComplexity: '',
        spaceComplexity: '',
        url: ''
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit problem')
      console.error('Problem submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Problem</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leetcodeId">LeetCode ID</Label>
              <Input
                id="leetcodeId"
                name="leetcodeId"
                required
                value={formData.leetcodeId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemName">Problem Name</Label>
              <Input
                id="problemName"
                name="problemName"
                required
                value={formData.problemName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, difficulty: value }))
              }
              value={formData.difficulty}
            >
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
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              name="solution"
              rows={4}
              value={formData.solution}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeComplexity">Time Complexity</Label>
              <Input
                id="timeComplexity"
                name="timeComplexity"
                value={formData.timeComplexity}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spaceComplexity">Space Complexity</Label>
              <Input
                id="spaceComplexity"
                name="spaceComplexity"
                value={formData.spaceComplexity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Problem URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Add Problem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}