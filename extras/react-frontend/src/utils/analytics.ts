import { FeedbackRecord, Sentiment } from '../types';

/**
 * Calculate sentiment counts for a given dataset
 */
export function calculateSentimentCounts(data: FeedbackRecord[]) {
  const counts = {
    [Sentiment.POSITIVE]: 0,
    [Sentiment.NEUTRAL]: 0,
    [Sentiment.NEGATIVE]: 0,
    total: 0
  };

  data.forEach(record => {
    counts[record.sentiment]++;
    counts.total++;
  });

  return counts;
}

/**
 * Split data into two periods for comparison
 */
export function splitIntoPeriods(
  data: FeedbackRecord[],
  dateRange: { start: string; end: string }
) {
  if (!data.length) return { periodA: [], periodB: [] };

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const halfDays = Math.ceil(totalDays / 2);

  const midpoint = new Date(startDate.getTime() + halfDays * 24 * 60 * 60 * 1000);

  const periodA = data.filter(item => new Date(item.createdAt) >= midpoint);
  const periodB = data.filter(item => new Date(item.createdAt) < midpoint);

  return { periodA, periodB };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Generate key insights based on data analysis
 */
export function generateInsights(
  currentData: FeedbackRecord[],
  allData: FeedbackRecord[]
): string[] {
  const insights: string[] = [];

  if (currentData.length === 0) {
    return ['No data available for the selected period.'];
  }

  const currentCounts = calculateSentimentCounts(currentData);
  const allCounts = calculateSentimentCounts(allData);

  // Insight 1: Positive sentiment trend
  const positivePercentCurrent = (currentCounts[Sentiment.POSITIVE] / currentCounts.total) * 100;
  const positivePercentAll = (allCounts[Sentiment.POSITIVE] / allCounts.total) * 100;

  if (positivePercentCurrent > positivePercentAll) {
    insights.push(
      `Positive sentiment in current period (${positivePercentCurrent.toFixed(1)}%) exceeds overall average (${positivePercentAll.toFixed(1)}%), indicating improved employee perception.`
    );
  } else if (positivePercentCurrent < positivePercentAll - 5) {
    insights.push(
      `Positive sentiment in current period (${positivePercentCurrent.toFixed(1)}%) is below average, suggesting recent concerns.`
    );
  }

  // Insight 2: Negative sentiment alert
  const negativePercentCurrent = (currentCounts[Sentiment.NEGATIVE] / currentCounts.total) * 100;
  if (negativePercentCurrent > 15) {
    insights.push(
      `Negative sentiment elevated at ${negativePercentCurrent.toFixed(1)}% of feedback. Consider addressing underlying issues.`
    );
  }

  // Insight 3: Sentiment diversity
  const neutralPercentCurrent = (currentCounts[Sentiment.NEUTRAL] / currentCounts.total) * 100;
  if (neutralPercentCurrent > 40) {
    insights.push(
      `High neutral sentiment (${neutralPercentCurrent.toFixed(1)}%) suggests mixed opinions. Further investigation recommended.`
    );
  }

  // If no specific insights generated, provide a general summary
  if (insights.length === 0) {
    insights.push(
      `Current period shows balanced sentiment distribution: ${positivePercentCurrent.toFixed(1)}% positive, ${neutralPercentCurrent.toFixed(1)}% neutral, ${negativePercentCurrent.toFixed(1)}% negative.`
    );
  }

  return insights.slice(0, 3); // Return max 3 insights
}

/**
 * Calculate sentiment drift (change over time)
 */
export function calculateSentimentDrift(
  periodA: FeedbackRecord[],
  periodB: FeedbackRecord[]
): {
  driftDetected: boolean;
  negativeIncrease: boolean;
  changePercent: number;
} {
  if (!periodA.length || !periodB.length) {
    return { driftDetected: false, negativeIncrease: false, changePercent: 0 };
  }

  const countsA = calculateSentimentCounts(periodA);
  const countsB = calculateSentimentCounts(periodB);

  const negativePercentA = (countsA[Sentiment.NEGATIVE] / countsA.total) * 100;
  const negativePercentB = (countsB[Sentiment.NEGATIVE] / countsB.total) * 100;

  const changePercent = calculatePercentageChange(negativePercentA, negativePercentB);
  const negativeIncrease = negativePercentA > negativePercentB;
  const driftDetected = Math.abs(changePercent) > 10; // Flag if change > 10%

  return { driftDetected, negativeIncrease, changePercent };
}

/**
 * Group data by month for trend analysis
 */
export function groupByMonth(data: FeedbackRecord[]) {
  const months: Record<string, FeedbackRecord[]> = {};

  data.forEach(item => {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = [];
    months[key].push(item);
  });

  return Object.entries(months)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([month, records]) => ({
      month,
      ...calculateSentimentCounts(records)
    }));
}
