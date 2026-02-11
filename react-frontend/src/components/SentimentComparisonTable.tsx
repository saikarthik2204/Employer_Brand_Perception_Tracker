import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import {
  calculateSentimentCounts,
  splitIntoPeriods,
  calculatePercentageChange
} from '../utils/analytics';

interface SentimentComparisonTableProps {
  data: FeedbackRecord[];
  dateRange: { start: string; end: string };
}

const SentimentComparisonTable: React.FC<SentimentComparisonTableProps> = ({
  data,
  dateRange
}) => {
  const comparisonData = useMemo(() => {
    const { periodA, periodB } = splitIntoPeriods(data, dateRange);

    const countsA = calculateSentimentCounts(periodA);
    const countsB = calculateSentimentCounts(periodB);

    return [
      {
        sentiment: Sentiment.POSITIVE,
        countA: countsA[Sentiment.POSITIVE],
        countB: countsB[Sentiment.POSITIVE],
        label: 'Positive'
      },
      {
        sentiment: Sentiment.NEUTRAL,
        countA: countsA[Sentiment.NEUTRAL],
        countB: countsB[Sentiment.NEUTRAL],
        label: 'Neutral'
      },
      {
        sentiment: Sentiment.NEGATIVE,
        countA: countsA[Sentiment.NEGATIVE],
        countB: countsB[Sentiment.NEGATIVE],
        label: 'Negative'
      }
    ].map(row => {
      const change = calculatePercentageChange(row.countA, row.countB);
      return { ...row, change };
    });
  }, [data, dateRange]);

  const getChangeColor = (value: number) => {
    if (Math.abs(value) < 1) return 'text-gray-500';
    if (value > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getChangeBgColor = (value: number) => {
    if (Math.abs(value) < 1) return 'bg-gray-50';
    if (value > 0) return 'bg-green-50';
    return 'bg-red-50';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="bg-white border rounded-xl p-6 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
        Period Comparison Analysis
      </h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">
                Sentiment Type
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">
                Recent Period
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">
                Earlier Period
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">
                Change %
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <motion.tr
                key={row.sentiment}
                variants={rowVariants}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  getChangeBgColor(row.change)
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          row.sentiment === Sentiment.POSITIVE
                            ? '#10b981'
                            : row.sentiment === Sentiment.NEUTRAL
                            ? '#f59e0b'
                            : '#f43f5e'
                      }}
                    ></div>
                    <span className="font-medium text-slate-800">{row.label}</span>
                  </div>
                </td>
                <td className="text-right py-3 px-4 font-semibold text-slate-800">
                  {row.countA}
                </td>
                <td className="text-right py-3 px-4 font-semibold text-slate-700">
                  {row.countB}
                </td>
                <td className={`text-right py-3 px-4 font-bold ${getChangeColor(row.change)}`}>
                  {row.change > 0 ? '+' : ''}{row.change.toFixed(1)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-slate-600">Positive increase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-600">Negative increase</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-slate-600">No significant change</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentComparisonTable;
