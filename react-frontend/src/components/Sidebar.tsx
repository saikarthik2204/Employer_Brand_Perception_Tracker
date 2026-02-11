
import React from 'react';
import { Sentiment, DateRange } from '../types';

interface SidebarProps {
  selectedSentiments: Sentiment[];
  setSelectedSentiments: React.Dispatch<React.SetStateAction<Sentiment[]>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  allDataCount: number;
  filteredCount: number;
  minDate?: string;
  maxDate?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedSentiments, 
  setSelectedSentiments, 
  dateRange, 
  setDateRange,
  allDataCount,
  filteredCount,
  minDate,
  maxDate
}) => {
  const toggleSentiment = (s: Sentiment) => {
    setSelectedSentiments(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:block h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Filters</h3>
          <div className="space-y-6">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">DATE PERIOD</label>
              <div className="space-y-2">
                <input 
                  type="date" 
                  value={dateRange.start}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setDateRange(prev => {
                      const end = prev.end;
                      // ensure start <= end
                      if (end && newStart > end) {
                        return { start: newStart, end: newStart };
                      }
                      return { ...prev, start: newStart };
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
                />
                <input 
                  type="date" 
                  value={dateRange.end}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setDateRange(prev => {
                      const start = prev.start;
                      // ensure end >= start
                      if (start && newEnd < start) {
                        return { start: newEnd, end: newEnd };
                      }
                      return { ...prev, end: newEnd };
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">SENTIMENT TYPES</label>
              <div className="space-y-2">
                {Object.values(Sentiment).map((s) => (
                  <label key={s} className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={selectedSentiments.includes(s)}
                        onChange={() => toggleSentiment(s)}
                      />
                      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-500 rounded peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:border-blue-600 dark:peer-checked:border-blue-500 transition-all flex items-center justify-center">
                        <svg className={`w-3 h-3 text-white ${selectedSentiments.includes(s) ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Dataset Summary</h4>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Displaying <span className="text-blue-600">{filteredCount}</span> of {allDataCount} records
              </p>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(filteredCount / allDataCount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            setSelectedSentiments(Object.values(Sentiment));
            setDateRange({
              start: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0]
            });
          }}
          className="w-full py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
