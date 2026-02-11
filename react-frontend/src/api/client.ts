/**
 * API client for fetching data from the Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Company {
  id: string;
  name: string;
  color: string;
  logo: string;
  available: boolean;
}

export interface CompaniesResponse {
  companies: Company[];
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface StatisticsResponse {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  all_data_total: number;
  company?: string;
  timestamp: string;
}

export interface DateRangeResponse {
  minDate: string;
  maxDate: string;
  company?: string;
}

export interface TimelineEntry {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TimelineResponse {
  timeline: TimelineEntry[];
  company?: string;
}

/**
 * Fetch list of available companies
 */
export async function fetchCompanies(): Promise<CompaniesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/companies`);
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch filtered sentiment data from the API
 */
export async function fetchData(
  sentiments: string[],
  startDate: string,
  endDate: string,
  company: string = 'microsoft'
) {
  const params = new URLSearchParams({
    company,
    sentiments: sentiments.join(','),
    startDate,
    endDate
  });

  const response = await fetch(`${API_BASE_URL}/api/data?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch statistics from the API
 */
export async function fetchStatistics(
  sentiments: string[],
  startDate: string,
  endDate: string,
  company: string = 'microsoft'
): Promise<StatisticsResponse> {
  const params = new URLSearchParams({
    company,
    sentiments: sentiments.join(','),
    startDate,
    endDate
  });

  const response = await fetch(`${API_BASE_URL}/api/statistics?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch available date range
 */
export async function fetchDateRange(company: string = 'microsoft'): Promise<DateRangeResponse> {
  const params = new URLSearchParams({ company });
  const response = await fetch(`${API_BASE_URL}/api/date-range?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch date range: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch timeline data
 */
export async function fetchTimeline(company: string = 'microsoft'): Promise<TimelineResponse> {
  const params = new URLSearchParams({ company });
  const response = await fetch(`${API_BASE_URL}/api/timeline?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch timeline: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Check API health
 */
export async function checkHealth(company: string = 'microsoft') {
  try {
    const params = new URLSearchParams({ company });
    const response = await fetch(`${API_BASE_URL}/api/health?${params}`);
    if (!response.ok) {
      return false;
    }
    return response.json();
  } catch {
    return null;
  }
}