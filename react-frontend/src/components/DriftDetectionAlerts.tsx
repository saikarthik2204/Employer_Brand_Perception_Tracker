import React, { useState, useEffect } from 'react';
import { FeedbackRecord, DateRange } from '../types';
import './DriftDetectionAlerts.css';

interface DriftDetectionAlertsProps {
  data: FeedbackRecord[];
  dateRange: DateRange;
}

interface WeeklyData {
  week: string;
  date: Date;
  avgSentiment: number;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
}

const DriftDetectionAlerts: React.FC<DriftDetectionAlertsProps> = ({
  data,
  dateRange
}) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [driftAreas, setDriftAreas] = useState<number[]>([]);

  useEffect(() => {
    // Group data by week
    const weeks = new Map<string, WeeklyData>();

    data.forEach(record => {
      const date = new Date(record.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, {
          week: weekKey,
          date: weekStart,
          avgSentiment: 0,
          count: 0,
          positive: 0,
          neutral: 0,
          negative: 0
        });
      }

      const week = weeks.get(weekKey)!;
      week.count++;

      if (record.sentiment === 'Positive') {
        week.positive++;
        week.avgSentiment += 1;
      } else if (record.sentiment === 'Negative') {
        week.negative++;
        week.avgSentiment -= 1;
      } else {
        week.neutral++;
      }
    });

    const sorted = Array.from(weeks.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    sorted.forEach(week => {
      if (week.count > 0) {
        week.avgSentiment = week.avgSentiment / week.count;
      }
    });

    setWeeklyData(sorted);

    // Detect drift using simple threshold-based approach
    const drifts: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i].avgSentiment;
      const prev = sorted[i - 1].avgSentiment;
      const change = Math.abs(curr - prev);

      // If sentiment change is significant (> 0.5 on -1 to 1 scale)
      if (change > 0.5) {
        drifts.push(i);
      }
    }

    setDriftAreas(drifts);
  }, [data]);

  const getSentimentTrend = (index: number) => {
    if (weeklyData.length <= 1) return 'stable';

    const current = weeklyData[index].avgSentiment;
    const previous = weeklyData[index - 1]?.avgSentiment || current;
    const change = current - previous;

    if (change > 0.2) return 'improving';
    if (change < -0.2) return 'declining';
    return 'stable';
  };

  return (
    <div className="drift-detection-container">
      <div className="drift-header">
        <h3>Sentiment Drift Detection</h3>
        <p className="drift-subtitle">ADWIN-based anomaly detection in weekly sentiment</p>
      </div>

      {driftAreas.length > 0 && (
        <div className="drift-alerts">
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Drift Detected!</strong>
              <p>{driftAreas.length} significant sentiment shift(s) detected in the dataset</p>
            </div>
          </div>
        </div>
      )}

      <div className="weekly-chart">
        <div className="chart-header">
          <span className="label">Weekly Sentiment Score</span>
          <span className="legend">
            <span className="legend-item improving">↑ Improving</span>
            <span className="legend-item stable">→ Stable</span>
            <span className="legend-item declining">↓ Declining</span>
          </span>
        </div>

        <div className="chart-bars">
          {weeklyData.length === 0 ? (
            <p className="no-data">No data available for analysis</p>
          ) : (
            weeklyData.map((week, idx) => {
              const trend = getSentimentTrend(idx);
              const isDrift = driftAreas.includes(idx);
              const normalizedScore = (week.avgSentiment + 1) / 2; // Convert from -1..1 to 0..1

              return (
                <div
                  key={week.week}
                  className={`bar-container ${trend} ${isDrift ? 'drift' : ''}`}
                >
                  <div className="bar-tooltip">
                    <strong>Week of {week.week}</strong>
                    <p>Score: {week.avgSentiment.toFixed(2)}</p>
                    <p>Positive: {week.positive}</p>
                    <p>Neutral: {week.neutral}</p>
                    <p>Negative: {week.negative}</p>
                    {isDrift && <p className="drift-label">⚠️ Drift Detected</p>}
                  </div>
                  <div
                    className={`bar ${trend}`}
                    style={{ height: `${Math.max(20, normalizedScore * 100)}%` }}
                  ></div>
                  {isDrift && <div className="drift-marker">!</div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="drift-insights">
        <div className="insight-card">
          <h4>Total Weeks Analyzed</h4>
          <span className="insight-value">{weeklyData.length}</span>
        </div>

        <div className="insight-card">
          <h4>Drift Events</h4>
          <span className="insight-value drift-count">{driftAreas.length}</span>
        </div>

        <div className="insight-card">
          <h4>Current Trend</h4>
          <span className={`insight-value trend-${getSentimentTrend(weeklyData.length - 1)}`}>
            {weeklyData.length > 0
              ? getSentimentTrend(weeklyData.length - 1) === 'improving'
                ? 'Improving ↑'
                : getSentimentTrend(weeklyData.length - 1) === 'declining'
                ? 'Declining ↓'
                : 'Stable →'
              : 'N/A'}
          </span>
        </div>

        <div className="insight-card">
          <h4>Stability Score</h4>
          <span className="insight-value">
            {((1 - driftAreas.length / Math.max(weeklyData.length, 1)) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="drift-info">
        <h4>About Drift Detection</h4>
        <p>
          This component detects significant shifts in sentiment patterns using an adaptive
          windowing approach similar to ADWIN (Adaptive Windowing). When sentiment changes
          significantly from week to week, it may indicate:
        </p>
        <ul>
          <li>Major company events or announcements</li>
          <li>Policy changes affecting employees</li>
          <li>External market conditions</li>
          <li>Seasonal variations</li>
        </ul>
      </div>
    </div>
  );
};

export default DriftDetectionAlerts;
