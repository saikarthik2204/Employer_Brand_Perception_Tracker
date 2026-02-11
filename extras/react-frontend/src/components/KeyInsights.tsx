import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackRecord } from '../types';
import { calculateSentimentStats, getPeriodComparison, generateInsights as generateInsightsUtil } from '../utils/dashboardAnalytics';

interface KeyInsightsProps {
  data: FeedbackRecord[];
  dateRange: { start: string; end: string };
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ data, dateRange }) => {
  const insights = useMemo(() => {
    const currentStats = calculateSentimentStats(data);
    const { previous } = getPeriodComparison(data, dateRange);
    return generateInsightsUtil(currentStats, previous.stats);
  }, [data, dateRange]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const insightVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm dark:shadow-lg transition-colors duration-300"
    >
      <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">
        Key Insights
      </h3>

      <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
        <AnimatePresence mode="wait">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <motion.div
                key={`insight-${index}`}
                variants={insightVariants}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 leading-relaxed transition-colors duration-300"
              >
                <span className="font-semibold text-slate-800 mr-2">{index + 1}.</span>
                {insight}
              </motion.div>
            ))
          ) : (
            <motion.p variants={insightVariants} className="text-sm text-slate-600">
              Analyzing data for insights...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default KeyInsights;
