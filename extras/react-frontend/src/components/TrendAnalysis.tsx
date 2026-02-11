import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { groupByMonth } from '../utils/dashboardAnalytics';

interface TrendAnalysisProps {
  data: FeedbackRecord[];
}

const COLORS = {
  [Sentiment.POSITIVE]: '#10b981',
  [Sentiment.NEUTRAL]: '#f59e0b',
  [Sentiment.NEGATIVE]: '#f43f5e'
};

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data }) => {
  const monthlyData = useMemo(() => groupByMonth(data), [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stacked Area Chart */}
      <motion.div
        variants={chartVariants}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm dark:shadow-lg transition-colors duration-300"
      >
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-widest">
          Sentiment Distribution Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <defs>
                <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNeu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.NEUTRAL]} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.NEUTRAL]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  padding: '10px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={Sentiment.POSITIVE}
                stackId="1"
                stroke={COLORS[Sentiment.POSITIVE]}
                fill="url(#gradPos)"
                strokeWidth={2}
                isAnimationActive
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey={Sentiment.NEUTRAL}
                stackId="1"
                stroke={COLORS[Sentiment.NEUTRAL]}
                fill="url(#gradNeu)"
                strokeWidth={2}
                isAnimationActive
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey={Sentiment.NEGATIVE}
                stackId="1"
                stroke={COLORS[Sentiment.NEGATIVE]}
                fill="url(#gradNeg)"
                strokeWidth={2}
                isAnimationActive
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly Bar Chart */}
      <motion.div
        variants={chartVariants}
        className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">
          Monthly Sentiment Volume
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '10px'
                }}
              />
              <Legend />
              <Bar dataKey={Sentiment.POSITIVE} fill={COLORS[Sentiment.POSITIVE]} radius={[4, 4, 0, 0]} />
              <Bar dataKey={Sentiment.NEUTRAL} fill={COLORS[Sentiment.NEUTRAL]} radius={[4, 4, 0, 0]} />
              <Bar dataKey={Sentiment.NEGATIVE} fill={COLORS[Sentiment.NEGATIVE]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrendAnalysis;
