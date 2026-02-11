import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeedbackRecord } from '../types';
import { calculateSentimentStats, getPeriodComparison, calculatePercentageChange } from '../utils/dashboardAnalytics';

interface KpiSummaryProps {
  data: FeedbackRecord[];
  dateRange?: { start: string; end: string };
}

const KpiSummary: React.FC<KpiSummaryProps> = ({ data, dateRange }) => {
  const stats = useMemo(() => {
    const current = calculateSentimentStats(data);
    const { previous } = getPeriodComparison(data, dateRange);
    const prevStats = previous.stats;
    
    return {
      current,
      posChange: calculatePercentageChange(current.positive, prevStats.positive),
      negChange: calculatePercentageChange(current.negative, prevStats.negative)
    };
  }, [data, dateRange]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const KpiCard = ({ 
    label, 
    value, 
    unit = '', 
    change = null 
  }: { 
    label: string; 
    value: string | number; 
    unit?: string;
    change?: { value: number; isPositive: boolean } | null;
  }) => (
    <motion.div
      variants={cardVariants}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300"
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {unit && <p className="text-xs text-slate-500 mt-1">{unit}</p>}
        </div>
        {change !== null && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-semibold ${
            change.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span>{change.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(change.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      <KpiCard
        label="Total Feedback"
        value={stats.current.total}
        unit="responses"
      />
      <KpiCard
        label="Positive Sentiment"
        value={stats.current.positivePercent.toFixed(1)}
        unit="%"
        change={{ value: stats.posChange, isPositive: stats.posChange >= 0 }}
      />
      <KpiCard
        label="Neutral Sentiment"
        value={stats.current.neutralPercent.toFixed(1)}
        unit="%"
      />
      <KpiCard
        label="Negative Sentiment"
        value={stats.current.negativePercent.toFixed(1)}
        unit="%"
        change={{ value: stats.negChange, isPositive: stats.negChange <= 0 }}
      />
      <KpiCard
        label="Processing Accuracy"
        value="100.0"
        unit="%"
      />
    </motion.div>
  );
};

export default KpiSummary;
