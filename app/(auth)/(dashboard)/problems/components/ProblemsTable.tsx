import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Code, FileText, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Problem } from '../types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Reusable component for expandable text fields (solution and notes)
const ExpandableText = ({ 
  text, 
  icon: Icon,
  label 
}: { 
  text?: string, 
  icon: React.ElementType,
  label: string 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!text) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <Icon size={16} />
        {label}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
              {text}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ProblemsTableProps {
  problems: Problem[]
  filteredProblems: Problem[]
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  searchQuery: string
  onDeleteComplete: () => void
}

export function ProblemsTable({
  problems,
  filteredProblems,
  currentPage,
  setCurrentPage,
  pageSize,
  searchQuery,
  onDeleteComplete
}: ProblemsTableProps) {
  const totalPages = Math.ceil(filteredProblems.length / pageSize)
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const { getToken } = useAuth()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken()
      const response = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete problem')
      }

      toast({
        title: "Problem deleted",
        description: "The problem has been removed from your history"
      })
      
      // Refresh the problems list
      onDeleteComplete()
    } catch (error) {
      toast({
        title: "Failed to delete problem",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
        <p className="text-base sm:text-lg font-medium text-foreground">No problems solved yet</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Start tracking your LeetCode progress by solving problems
        </p>
      </div>
    )
  }

  if (filteredProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-base font-medium text-foreground">No matching problems found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search query
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Problem</TableHead>
              <TableHead className="font-semibold w-36">Status</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Complexity</TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
              <TableHead className="font-semibold text-center w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProblems.map((problem) => {
              const confidenceScore = problem.difficultyRating 
                ? Math.max(0, 10 - problem.difficultyRating - (problem.attempts - 1))
                : Math.max(0, 10 - (problem.attempts - 1));

              const needsReview = problem.nextReview && new Date(problem.nextReview) <= new Date();

              return (
                <TableRow 
                  key={problem.id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <a 
                          href={problem.url || `https://leetcode.com/problems/${problem.leetcodeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {problem.problemName}
                        </a>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{problem.leetcodeId}</span>
                        <span>•</span>
                        <span>Solved {formatDate(problem.solvedAt)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex flex-col items-start gap-1">
                            <div className={cn(
                              "text-sm font-medium",
                              confidenceScore >= 7 ? 'text-green-500' :
                              confidenceScore >= 4 ? 'text-yellow-500' :
                              'text-red-500'
                            )}>
                              {confidenceScore >= 7 ? 'High' :
                               confidenceScore >= 4 ? 'Medium' :
                               'Low'}
                            </div>
                            <div className="flex flex-col text-xs text-muted-foreground">
                              <span>
                                {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}
                              </span>
                              {problem.difficultyRating && (
                                <span>
                                  Rated {problem.difficultyRating}/10
                                </span>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Confidence score: {confidenceScore.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Based on attempts and self-rating</p>
                          {problem.difficultyRating && (
                            <p className="text-xs text-muted-foreground mt-1">Your difficulty rating: {problem.difficultyRating}/10</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      {problem.timeComplexity && (
                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Time: {problem.timeComplexity}
                        </span>
                      )}
                      {problem.spaceComplexity && (
                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                          Space: {problem.spaceComplexity}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {problem.solution && (
                        <ExpandableText
                          text={problem.solution}
                          icon={Code}
                          label="Solution"
                        />
                      )}
                      {problem.notes && (
                        <ExpandableText
                          text={problem.notes}
                          icon={FileText}
                          label="Notes"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this problem from your history.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(problem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredProblems.length)} of {filteredProblems.length} {searchQuery && `(filtered from ${problems.length})`} problems
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                className="w-8"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
} 