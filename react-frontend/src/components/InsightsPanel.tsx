
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { generateInsights } from '../utils/analytics';

interface InsightsPanelProps {
  data: FeedbackRecord[];
  allData: FeedbackRecord[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ data, allData }) => {
  const insights = useMemo(() => {
    return generateInsights(data, allData);
  }, [data, allData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const insightVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Key Insights Card */}
      <motion.div
        variants={insightVariants}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Key Insights</h3>
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="wait">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <motion.div
                      key={`insight-${index}`}
                      variants={insightVariants}
                      className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-2 rounded bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm transition-colors duration-300"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-100 mr-2">{index + 1}.</span>
                      {insight}
                    </motion.div>
                  ))
                ) : (
                  <motion.p variants={insightVariants} className="text-sm text-slate-600 dark:text-slate-400">
                    No specific insights for the selected period. Data analysis in progress.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InsightsPanel;
