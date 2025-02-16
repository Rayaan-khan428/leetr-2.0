export interface Problem {
  id: string
  userId: string
  leetcodeId: string
  problemName: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  solvedAt: string
  timeComplexity?: string
  spaceComplexity?: string
  solution?: string
  notes?: string
  attempts: number
  url?: string
  nextReview?: string
  createdAt: string
  updatedAt: string
  difficultyRating?: number
} 