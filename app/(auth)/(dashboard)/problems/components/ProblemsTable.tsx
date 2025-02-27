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

import { MainCategory, SubCategory } from '../types'
import { Badge } from "@/components/ui/badge"

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

const getCategoryColor = (category: MainCategory) => {
  const colors: Record<string, { bg: string; text: string }> = {
    ARRAY_STRING: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
    HASH_BASED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
    LINKED: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
    STACK_QUEUE: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
    TREE: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-300' },
    GRAPH: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300' },
  }
  return colors[category] || { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300' }
}

const formatCategoryName = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join('/')
}

const getDifficultyScore = (difficulty: string) => {
  switch (difficulty) {
    case 'EASY': return 3;
    case 'MEDIUM': return 6;
    case 'HARD': return 9;
    default: return 0;
  }
}

const getRatingColor = (score: number) => {
  if (score >= 8) return 'text-red-500 dark:text-red-400';
  if (score >= 5) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-green-500 dark:text-green-400';
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
            <TableRow className="border-b border-muted hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Problem</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">LeetCode</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Your Rating</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Attempts</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Complexity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Next Review</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProblems.map((problem) => (
              <TableRow 
                key={problem.id}
                className="border-b border-muted/50 hover:bg-muted/5 transition-colors"
              >
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <a 
                      href={problem.url || `https://leetcode.com/problems/${problem.leetcodeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {problem.problemName}
                    </a>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      #{problem.leetcodeId} • {formatDate(problem.solvedAt)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <div className="flex flex-col gap-1.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              getCategoryColor(problem.mainCategory).bg,
                              getCategoryColor(problem.mainCategory).text
                            )}>
                              {formatCategoryName(problem.mainCategory)}
                            </span>
                            {problem.subCategories && problem.subCategories.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{problem.subCategories.length}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        {problem.subCategories && problem.subCategories.length > 0 && (
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Sub-categories:</p>
                              <ul className="text-xs space-y-0.5">
                                {problem.subCategories.map((subCat) => (
                                  <li key={subCat}>{formatCategoryName(subCat)}</li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <span className={cn(
                    "text-sm",
                    getRatingColor(getDifficultyScore(problem.difficulty))
                  )}>
                    {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
                  </span>
                </TableCell>

                <TableCell className="py-3">
                  {problem.difficultyRating ? (
                    <span className={cn(
                      "text-sm",
                      getRatingColor(problem.difficultyRating)
                    )}>
                      {problem.difficultyRating}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  <span className="text-sm">
                    {problem.attempts}
                  </span>
                </TableCell>

                <TableCell className="hidden sm:table-cell py-3">
                  <div className="space-y-1">
                    {problem.timeComplexity && (
                      <span className="text-xs text-muted-foreground">
                        O({problem.timeComplexity})
                      </span>
                    )}
                    {problem.spaceComplexity && (
                      <span className="text-xs text-muted-foreground block">
                        O({problem.spaceComplexity})
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="hidden sm:table-cell py-3">
                  {problem.nextReview ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className={cn(
                            "text-xs",
                            new Date(problem.nextReview) <= new Date() 
                              ? "text-red-500 dark:text-red-400"
                              : "text-muted-foreground"
                          )}>
                            {formatDate(problem.nextReview)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {new Date(problem.nextReview) <= new Date() 
                            ? "Review is due"
                            : "Scheduled review date"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right py-3">
                  <div className="flex items-center justify-end gap-3">
                    {problem.solution && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                const expandable = document.querySelector(`[data-solution="${problem.id}"]`) as HTMLButtonElement;
                                if (expandable) expandable.click();
                              }}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Code size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>View Solution</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {problem.notes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                const expandable = document.querySelector(`[data-notes="${problem.id}"]`) as HTMLButtonElement;
                                if (expandable) expandable.click();
                              }}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <FileText size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>View Notes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {/* Hidden expandable components */}
                  {problem.solution && (
                    <div className="hidden">
                      <ExpandableText
                        text={problem.solution}
                        icon={Code}
                        label="Solution"
                        data-solution={problem.id}
                      />
                    </div>
                  )}
                  {problem.notes && (
                    <div className="hidden">
                      <ExpandableText
                        text={problem.notes}
                        icon={FileText}
                        label="Notes"
                        data-notes={problem.id}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
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