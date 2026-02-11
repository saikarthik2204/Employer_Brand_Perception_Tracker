import { FeedbackRecord, Sentiment } from '../types';

/**
 * Calculate sentiment statistics for a given dataset
 */
export function calculateSentimentStats(data: FeedbackRecord[]) {
  if (!data.length) {
    return {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      positivePercent: 0,
      neutralPercent: 0,
      negativePercent: 0
    };
  }

  const positive = data.filter(r => r.sentiment === Sentiment.POSITIVE).length;
  const neutral = data.filter(r => r.sentiment === Sentiment.NEUTRAL).length;
  const negative = data.filter(r => r.sentiment === Sentiment.NEGATIVE).length;
  const total = data.length;

  return {
    total,
    positive,
    neutral,
    negative,
    positivePercent: (positive / total) * 100,
    neutralPercent: (neutral / total) * 100,
    negativePercent: (negative / total) * 100
  };
}

/**
 * Split data into current and previous periods
 */
export function getPeriodComparison(
  data: FeedbackRecord[],
  dateRange?: { start: string; end: string }
) {
  if (!data.length || !dateRange) {
    return {
      current: { data: [], stats: calculateSentimentStats([]) },
      previous: { data: [], stats: calculateSentimentStats([]) }
    };
  }

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const halfDays = Math.ceil(totalDays / 2);
  const midpoint = new Date(startDate.getTime() + halfDays * 24 * 60 * 60 * 1000);

  const currentPeriodData = data.filter(item => new Date(item.createdAt) >= midpoint);
  const previousPeriodData = data.filter(item => new Date(item.createdAt) < midpoint);

  return {
    current: { data: currentPeriodData, stats: calculateSentimentStats(currentPeriodData) },
    previous: { data: previousPeriodData, stats: calculateSentimentStats(previousPeriodData) }
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Generate key insights from sentiment data
 */
export function generateInsights(
  currentStats: ReturnType<typeof calculateSentimentStats>,
  previousStats: ReturnType<typeof calculateSentimentStats>
): string[] {
  const insights: string[] = [];

  if (currentStats.total === 0) return ['No data available for selected period.'];

  const posChange = calculatePercentageChange(currentStats.positive, previousStats.positive);
  const negChange = calculatePercentageChange(currentStats.negative, previousStats.negative);

  // Insight 1: Positive sentiment trend
  if (posChange > 10) {
    insights.push(`Positive sentiment increased by ${posChange.toFixed(1)}% compared to previous period.`);
  } else if (posChange < -10) {
    insights.push(`Positive sentiment decreased by ${Math.abs(posChange).toFixed(1)}% compared to previous period.`);
  }

  // Insight 2: Negative sentiment trend
  if (currentStats.negativePercent > 20) {
    insights.push(`Negative sentiment is elevated at ${currentStats.negativePercent.toFixed(1)}% - monitor closely.`);
  } else if (negChange > 15) {
    insights.push(`Negative sentiment shows a rising trend with ${negChange.toFixed(1)}% increase.`);
  }

  // Insight 3: Overall sentiment balance
  if (insights.length === 0) {
    if (currentStats.positivePercent > 60) {
      insights.push(`Strong positive sentiment dominance at ${currentStats.positivePercent.toFixed(1)}%.`);
    } else if (currentStats.neutralPercent > 50) {
      insights.push(`Sentiment remains balanced with ${currentStats.neutralPercent.toFixed(1)}% neutral feedback.`);
    }
  }

  return insights.slice(0, 3);
}

/**
 * Group data by month
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
    .map(([month, records]) => {
      const stats = calculateSentimentStats(records);
      return {
        month,
        [Sentiment.POSITIVE]: stats.positive,
        [Sentiment.NEUTRAL]: stats.neutral,
        [Sentiment.NEGATIVE]: stats.negative,
        total: stats.total
      };
    });
}
