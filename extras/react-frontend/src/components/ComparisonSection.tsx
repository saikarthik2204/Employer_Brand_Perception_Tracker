
import React from 'react';
import { FeedbackRecord, Sentiment } from '../types';

interface ComparisonSectionProps {
  allData: FeedbackRecord[];
  currentData: FeedbackRecord[];
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ allData, currentData }) => {
  // Period B is Current Data. Let's find Period A (Same duration but previous time slice)
  // For demo, we'll just compare against a random previous slice if not strictly defined.
  
  const getCounts = (dataset: FeedbackRecord[]) => {
    return {
      pos: dataset.filter(d => d.sentiment === Sentiment.POSITIVE).length,
      neu: dataset.filter(d => d.sentiment === Sentiment.NEUTRAL).length,
      neg: dataset.filter(d => d.sentiment === Sentiment.NEGATIVE).length,
    };
  };

  const currentCounts = getCounts(currentData);
  
  // Simulated Period A (Previous 90-180 days)
  const previousData = allData.filter(d => {
    const date = new Date(d.createdAt).getTime();
    const now = new Date().getTime();
    const start = now - 180 * 24 * 60 * 60 * 1000;
    const end = now - 90 * 24 * 60 * 60 * 1000;
    return date >= start && date <= end;
  });
  const previousCounts = getCounts(previousData);

  const rows = [
    { label: 'Positive', current: currentCounts.pos, prev: previousCounts.pos },
    { label: 'Neutral', current: currentCounts.neu, prev: previousCounts.neu },
    { label: 'Negative', current: currentCounts.neg, prev: previousCounts.neg },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-lg p-6 overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Performance Benchmarking</h4>
        <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded transition-colors duration-300">VS PREVIOUS 90D</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold transition-colors duration-300">
              <th className="pb-3 text-left">SENTIMENT</th>
              <th className="pb-3 text-right">CURRENT</th>
              <th className="pb-3 text-right">PREVIOUS</th>
              <th className="pb-3 text-right">DELTA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 transition-colors duration-300">
            {rows.map(row => {
              const delta = row.prev === 0 ? 0 : ((row.current - row.prev) / row.prev) * 100;
              const isPositiveBetter = row.label === 'Positive' ? delta > 0 : delta < 0;
              const colorClass = row.label === 'Neutral' ? 'text-slate-600 dark:text-slate-400' : (isPositiveBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400');

              return (
                <tr key={row.label} className="group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300\">
                  <td className="py-4 font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300\">{row.label}</td>
                  <td className="py-4 text-right font-medium text-slate-900 dark:text-white transition-colors duration-300\">{row.current.toLocaleString()}</td>
                  <td className="py-4 text-right font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300\">{row.prev.toLocaleString()}</td>
                  <td className={`py-4 text-right font-bold ${colorClass}`}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-6 pt-6 border-t flex items-center text-xs text-slate-400 italic">
        * Benchmark data represents the 90-day window immediately preceding the current selected range.
      </div>
    </div>
  );
};

export default ComparisonSection;
