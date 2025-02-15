export interface SpacedRepetitionParams {
  attempts: number;
  lastReviewDate: Date;
  difficultyRating: number; // 1-5 scale where 1 is easiest, 5 is hardest
}

export function calculateNextReview({ attempts, lastReviewDate, difficultyRating }: SpacedRepetitionParams): Date {
  const baseIntervals = [1, 3, 7, 14, 30, 60, 120]; // Base days between reviews
  const nextBaseInterval = baseIntervals[Math.min(attempts - 1, baseIntervals.length - 1)];
  
  // Calculate difficulty modifier (0.5 to 1.5)
  // Difficulty rating of 3 = no change (multiplier of 1.0)
  // Difficulty rating of 1 = longer intervals (multiplier of 1.5)
  // Difficulty rating of 5 = shorter intervals (multiplier of 0.5)
  const difficultyModifier = 1.5 - ((difficultyRating - 1) * 0.25);
  
  // Apply the modifier to get the actual interval
  const adjustedInterval = Math.round(nextBaseInterval * difficultyModifier);
  
  // Ensure minimum interval is 1 day
  const finalInterval = Math.max(1, adjustedInterval);
  
  const nextReview = new Date(lastReviewDate);
  nextReview.setDate(nextReview.getDate() + finalInterval);
  return nextReview;
}

// Helper function to validate difficulty rating
export function validateDifficultyRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}