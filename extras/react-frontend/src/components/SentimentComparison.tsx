import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { getPeriodComparison, calculatePercentageChange } from '../utils/dashboardAnalytics';

interface SentimentComparisonProps {
  data: FeedbackRecord[];
  dateRange: { start: string; end: string };
}

const SentimentComparison: React.FC<SentimentComparisonProps> = ({ data, dateRange }) => {
  const comparisonData = useMemo(() => {
    const { current, previous } = getPeriodComparison(data, dateRange);

    return [
      {
        sentiment: Sentiment.POSITIVE,
        label: 'Positive',
        currentCount: current.stats.positive,
        previousCount: previous.stats.positive,
        change: calculatePercentageChange(current.stats.positive, previous.stats.positive),
        color: 'text-green-600'
      },
      {
        sentiment: Sentiment.NEUTRAL,
        label: 'Neutral',
        currentCount: current.stats.neutral,
        previousCount: previous.stats.neutral,
        change: calculatePercentageChange(current.stats.neutral, previous.stats.neutral),
        color: 'text-amber-600'
      },
      {
        sentiment: Sentiment.NEGATIVE,
        label: 'Negative',
        currentCount: current.stats.negative,
        previousCount: previous.stats.negative,
        change: calculatePercentageChange(current.stats.negative, previous.stats.negative),
        color: 'text-red-600'
      }
    ];
  }, [data, dateRange]);

  const getChangeColor = (value: number) => {
    if (Math.abs(value) < 1) return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    if (value > 0) return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm dark:shadow-lg transition-colors duration-300"
    >
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-widest">
        Period Comparison Analysis
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 transition-colors duration-300">
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Sentiment</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Recent Period</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Previous Period</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <motion.tr
                key={row.sentiment}
                variants={rowVariants}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${row.color}`}></div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ row.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-white">
                  {row.currentCount}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                  {row.previousCount}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${getChangeColor(row.change).split(' ')[0]} ${getChangeColor(row.change).split(' ').slice(1).join(' ')}`}>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${getChangeColor(row.change)}`}>
                    {row.change > 0 ? '+' : ''}{row.change.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-slate-600">Increase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-600">Decrease</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          <span className="text-slate-600">No Change</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentComparison;
