export type Problem = {
  id: string
  leetcodeId: string
  problemName: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  solution?: string
  notes?: string
  solvedAt: string
  attempts: number
  timeComplexity?: string
  spaceComplexity?: string
  url?: string
  nextReview?: string
  difficultyRating?: number
  mainCategory: MainCategory
  subCategories?: SubCategory[]
}

export enum MainCategory {
  ARRAY_STRING = 'ARRAY_STRING',
  HASH_BASED = 'HASH_BASED',
  LINKED = 'LINKED',
  STACK_QUEUE = 'STACK_QUEUE',
  TREE = 'TREE',
  GRAPH = 'GRAPH'
}

export enum SubCategory {
  // Array/String
  ARRAY = 'ARRAY',
  STRING = 'STRING',
  TWO_POINTERS = 'TWO_POINTERS',
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  MATRIX = 'MATRIX',

  // Hash Based
  HASH_MAP = 'HASH_MAP',
  HASH_SET = 'HASH_SET',

  // Linked
  SINGLY_LINKED = 'SINGLY_LINKED',
  DOUBLY_LINKED = 'DOUBLY_LINKED',
  CIRCULAR_LINKED = 'CIRCULAR_LINKED',

  // Stack/Queue
  STACK = 'STACK',
  QUEUE = 'QUEUE',
  DEQUE = 'DEQUE',
  PRIORITY_QUEUE = 'PRIORITY_QUEUE',

  // Tree
  BINARY_TREE = 'BINARY_TREE',
  BINARY_SEARCH_TREE = 'BINARY_SEARCH_TREE',
  NARY_TREE = 'NARY_TREE',
  TRIE = 'TRIE',
  SEGMENT_TREE = 'SEGMENT_TREE',

  // Graph
  DIRECTED_GRAPH = 'DIRECTED_GRAPH',
  UNDIRECTED_GRAPH = 'UNDIRECTED_GRAPH',
  DFS = 'DFS',
  BFS = 'BFS',
  TOPOLOGICAL_SORT = 'TOPOLOGICAL_SORT'
} 