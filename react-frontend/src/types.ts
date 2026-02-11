
export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative'
}

export interface FeedbackRecord {
  id: string;
  text: string;
  createdAt: string;
  sentiment: Sentiment;
  company?: string;
}

export interface Company {
  id: string;
  name: string;
  color: string;
  logo: string;
  available: boolean;
}

export interface SentimentStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ComparisonData {
  label: string;
  periodA: number;
  periodB: number;
  delta: number;
}
