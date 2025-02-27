import { PrismaClient, ProblemCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProblemCategories() {
  try {
    // Get all problems
    const problems = await prisma.user_problems.findMany();
    
    console.log(`Found ${problems.length} problems to process`);

    // Update each problem with default category if none exists
    for (const problem of problems) {
      // You might want to fetch the actual categories from LeetCode API here
      // For now, we'll set a default category based on the problem name/id
      // This is where you'd implement the logic to determine the actual categories
      const defaultCategory = [ProblemCategory.ARRAY]; // Replace with actual logic
      
      await prisma.user_problems.update({
        where: { id: problem.id },
        data: {
          categories: defaultCategory,
        },
      });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProblemCategories(); 