/*
  Warnings:

  - You are about to drop the `problem_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_problems_to_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProblemCategory" AS ENUM ('ARRAY', 'STRING', 'HASH_TABLE', 'DYNAMIC_PROGRAMMING', 'MATH', 'SORTING', 'GREEDY', 'DEPTH_FIRST_SEARCH', 'BINARY_SEARCH', 'DATABASE', 'BREADTH_FIRST_SEARCH', 'TREE', 'BINARY_TREE', 'MATRIX', 'TWO_POINTERS', 'BIT_MANIPULATION', 'STACK', 'HEAP_PRIORITY_QUEUE', 'GRAPH', 'PREFIX_SUM', 'SIMULATION', 'DESIGN', 'COUNTING', 'BACKTRACKING', 'SLIDING_WINDOW', 'UNION_FIND', 'LINKED_LIST', 'ORDERED_SET', 'MONOTONIC_STACK', 'ENUMERATION', 'RECURSION', 'TRIE', 'DIVIDE_AND_CONQUER', 'BINARY_SEARCH_TREE', 'QUEUE', 'MEMOIZATION', 'GEOMETRY', 'SEGMENT_TREE', 'GAME_THEORY', 'HASH_FUNCTION', 'ROLLING_HASH', 'SHORTEST_PATH', 'COMBINATORICS', 'INTERACTIVE', 'CONCURRENCY', 'NUMBER_THEORY', 'MERGE_SORT', 'PROBABILITY_AND_STATISTICS', 'BRAINTEASER', 'MONOTONIC_QUEUE', 'RANDOMIZED', 'DATA_STREAM', 'BINARY_INDEXED_TREE', 'STRING_MATCHING');

-- DropForeignKey
ALTER TABLE "user_problems_to_categories" DROP CONSTRAINT "user_problems_to_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "user_problems_to_categories" DROP CONSTRAINT "user_problems_to_categories_problemId_fkey";

-- AlterTable
ALTER TABLE "user_problems" ADD COLUMN     "categories" "ProblemCategory"[];

-- DropTable
DROP TABLE "problem_categories";

-- DropTable
DROP TABLE "user_problems_to_categories";
