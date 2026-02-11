
import React from 'react';
import { FeedbackRecord, Sentiment } from '../types';

interface KpiSectionProps {
  data: FeedbackRecord[];
}

const KpiCard: React.FC<{ 
  label: string; 
  value: number; 
  percentage: number; 
  color: string;
  delay: string;
}> = ({ label, value, percentage, color, delay }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</h4>
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</div>
        <div className="flex items-center text-sm font-medium">
          <span className={`${percentage > 50 ? 'text-emerald-600' : 'text-slate-600'}`}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-slate-400 ml-1 text-xs font-normal">of total feedback</span>
        </div>
      </div>
    </div>
  );
};

const KpiSection: React.FC<KpiSectionProps> = ({ data }) => {
  const stats = {
    total: data.length,
    positive: data.filter(d => d.sentiment === Sentiment.POSITIVE).length,
    neutral: data.filter(d => d.sentiment === Sentiment.NEUTRAL).length,
    negative: data.filter(d => d.sentiment === Sentiment.NEGATIVE).length,
  };

  const getPct = (val: number) => stats.total > 0 ? (val / stats.total) * 100 : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard 
        label="Total Feedback" 
        value={stats.total} 
        percentage={100} 
        color="bg-slate-600" 
        delay="0s" 
      />
      <KpiCard 
        label="Positive" 
        value={stats.positive} 
        percentage={getPct(stats.positive)} 
        color="bg-emerald-500" 
        delay="0.1s" 
      />
      <KpiCard 
        label="Neutral" 
        value={stats.neutral} 
        percentage={getPct(stats.neutral)} 
        color="bg-amber-500" 
        delay="0.2s" 
      />
      <KpiCard 
        label="Negative" 
        value={stats.negative} 
        percentage={getPct(stats.negative)} 
        color="bg-rose-500" 
        delay="0.3s" 
      />
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default KpiSection;
