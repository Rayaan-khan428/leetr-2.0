export function calculateNextReview(attempts: number, lastReviewDate: Date): Date {
    const intervals = [1, 3, 7, 14, 30, 60, 120]; // Days between reviews
    const nextInterval = intervals[Math.min(attempts - 1, intervals.length - 1)];
    
    const nextReview = new Date(lastReviewDate);
    nextReview.setDate(nextReview.getDate() + nextInterval);
    return nextReview;
  }