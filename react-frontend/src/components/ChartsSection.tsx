
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';

interface ChartsSectionProps {
  data: FeedbackRecord[];
}

const COLORS = {
  [Sentiment.POSITIVE]: '#10b981',
  [Sentiment.NEUTRAL]: '#f59e0b',
  [Sentiment.NEGATIVE]: '#f43f5e'
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {
  const pieData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all sentiments are present (so chart always shows three slices)
    const all = [Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE];
    return all.map(name => ({ name, value: counts[name] || 0 }));
  }, [data]);

  const trendData = useMemo(() => {
    // Group by month
    const groups: Record<string, any> = {};
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = { name: key, [Sentiment.POSITIVE]: 0, [Sentiment.NEUTRAL]: 0, [Sentiment.NEGATIVE]: 0 };
      groups[key][item.sentiment]++;
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  // Create a unique key for animation triggering on data change
  const dataKey = useMemo(() => JSON.stringify(pieData.map(d => d.value)), [pieData]);

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        <motion.div 
          key={dataKey}
          initial="initial"
          animate="animate"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Donut Chart Container */}
          <motion.div 
            variants={cardVariants}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-lg flex flex-col transition-colors duration-300"
          >
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Sentiment Distribution</h4>
            <div className="flex-1 w-full" style={{ minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as Sentiment]} />
                    ))}
                  </Pie>
                  <ReTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ fontWeight: 600, fontSize: '12px', color: '#e2e8f0' }}
                  />
                  {/* Center label: total */}
                  {(() => {
                    const total = pieData.reduce((s, p) => s + (p.value || 0), 0);
                    return (
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-6" style={{ fontSize: 18, fontWeight: 700, fill: 'currentColor' }}>{total}</tspan>
                        <tspan x="50%" dy="18" style={{ fontSize: 12, fill: '#64748b' }}>Total</tspan>
                      </text>
                    );
                  })()}
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-4">
              {pieData.map(p => {
                const total = pieData.reduce((s, it) => s + (it.value || 0), 0) || 1;
                const pct = ((p.value / total) * 100).toFixed(0);
                return (
                  <div key={p.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[p.name as Sentiment] }}></div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      <span className="uppercase tracking-wide">{p.name}</span>
                      <span className="ml-2 text-slate-500">{p.value} ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Volume Trend Chart Container */}
          <motion.div 
            variants={cardVariants}
            className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-lg transition-colors duration-300"
          >
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Sentiment Volume Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={COLORS[Sentiment.POSITIVE]} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0.05}/>
                      <stop offset="95%" stopColor={COLORS[Sentiment.NEGATIVE]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={11} 
                    stroke="#94a3b8" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontWeight: 500 }}
                  />
                  <YAxis 
                    fontSize={11} 
                    stroke="#94a3b8" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontWeight: 500 }}
                  />
                  <ReTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#1e293b', color: '#f1f5f9' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={Sentiment.POSITIVE} 
                    stroke={COLORS[Sentiment.POSITIVE]} 
                    fillOpacity={1} 
                    fill="url(#colorPos)" 
                    strokeWidth={2.5}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                  />
                  <Area 
                    type="monotone" 
                    dataKey={Sentiment.NEGATIVE} 
                    stroke={COLORS[Sentiment.NEGATIVE]} 
                    fillOpacity={1} 
                    fill="url(#colorNeg)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChartsSection;
