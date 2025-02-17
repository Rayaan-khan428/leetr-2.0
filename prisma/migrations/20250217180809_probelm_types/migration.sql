/*
  Warnings:

  - Added the required column `mainCategory` to the `user_problems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MainCategory" AS ENUM ('ARRAY_STRING', 'HASH_BASED', 'LINKED', 'STACK_QUEUE', 'TREE', 'GRAPH');

-- CreateEnum
CREATE TYPE "SubCategory" AS ENUM ('ARRAY', 'STRING', 'TWO_POINTERS', 'SLIDING_WINDOW', 'MATRIX', 'HASH_MAP', 'HASH_SET', 'SINGLY_LINKED', 'DOUBLY_LINKED', 'CIRCULAR_LINKED', 'STACK', 'QUEUE', 'DEQUE', 'PRIORITY_QUEUE', 'BINARY_TREE', 'BINARY_SEARCH_TREE', 'NARY_TREE', 'TRIE', 'SEGMENT_TREE', 'DIRECTED_GRAPH', 'UNDIRECTED_GRAPH', 'DFS', 'BFS', 'TOPOLOGICAL_SORT');

-- AlterTable
ALTER TABLE "user_problems" ADD COLUMN     "mainCategory" "MainCategory" NOT NULL,
ADD COLUMN     "subCategories" "SubCategory"[];
