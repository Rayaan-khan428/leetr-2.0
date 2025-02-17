-- CreateTable
CREATE TABLE "problem_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_problems_to_categories" (
    "problemId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "user_problems_to_categories_pkey" PRIMARY KEY ("problemId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "problem_categories_name_key" ON "problem_categories"("name");

-- CreateIndex
CREATE INDEX "user_problems_to_categories_categoryId_idx" ON "user_problems_to_categories"("categoryId");

-- CreateIndex
CREATE INDEX "user_problems_to_categories_problemId_idx" ON "user_problems_to_categories"("problemId");

-- AddForeignKey
ALTER TABLE "user_problems_to_categories" ADD CONSTRAINT "user_problems_to_categories_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "user_problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problems_to_categories" ADD CONSTRAINT "user_problems_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "problem_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
