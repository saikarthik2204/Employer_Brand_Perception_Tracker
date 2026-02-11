import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { groupByMonth } from '../utils/analytics';

interface MultiGraphTrendAnalysisProps {
  data: FeedbackRecord[];
}

const COLORS = {
  [Sentiment.POSITIVE]: '#10b981',
  [Sentiment.NEUTRAL]: '#f59e0b',
  [Sentiment.NEGATIVE]: '#f43f5e'
};

const MultiGraphTrendAnalysis: React.FC<MultiGraphTrendAnalysisProps> = ({ data }) => {
  const monthlyData = useMemo(() => {
    const grouped = groupByMonth(data);
    return grouped.map(item => ({
      name: item.month,
      [Sentiment.POSITIVE]: item[Sentiment.POSITIVE] || 0,
      [Sentiment.NEUTRAL]: item[Sentiment.NEUTRAL] || 0,
      [Sentiment.NEGATIVE]: item[Sentiment.NEGATIVE] || 0,
      total: item.total || 0
    }));
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stacked Area Chart */}
      <motion.div
        variants={cardVariants}
        className="bg-white border rounded-xl p-6 shadow-sm"
      >
        <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
          Sentiment Distribution Over Time (Stacked)
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <defs>
                <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.NEUTRAL]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.NEUTRAL]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                fontSize={11}
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={Sentiment.POSITIVE}
                stackId="1"
                stroke={COLORS[Sentiment.POSITIVE]}
                fill="url(#gradPositive)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey={Sentiment.NEUTRAL}
                stackId="1"
                stroke={COLORS[Sentiment.NEUTRAL]}
                fill="url(#gradNeutral)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey={Sentiment.NEGATIVE}
                stackId="1"
                stroke={COLORS[Sentiment.NEGATIVE]}
                fill="url(#gradNegative)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly Bar Chart */}
      <motion.div
        variants={cardVariants}
        className="bg-white border rounded-xl p-6 shadow-sm"
      >
        <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
          Monthly Sentiment Volume Comparison
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                fontSize={11}
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Legend />
              <Bar
                dataKey={Sentiment.POSITIVE}
                fill={COLORS[Sentiment.POSITIVE]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar
                dataKey={Sentiment.NEUTRAL}
                fill={COLORS[Sentiment.NEUTRAL]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar
                dataKey={Sentiment.NEGATIVE}
                fill={COLORS[Sentiment.NEGATIVE]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiGraphTrendAnalysis;
