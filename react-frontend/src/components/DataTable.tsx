
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';

interface DataTableProps {
  data: FeedbackRecord[];
}

type SortField = 'date' | 'sentiment' | 'text';
type SortOrder = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 8;

  const filtered = useMemo(() =>
    data.filter(item =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [data, searchTerm]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortField === 'date') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortField === 'sentiment') {
        aVal = a.sentiment;
        bVal = b.sentiment;
      } else {
        aVal = a.text.toLowerCase();
        bVal = b.text.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const currentItems = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSentimentStyles = (s: Sentiment) => {
    switch (s) {
      case Sentiment.POSITIVE:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case Sentiment.NEUTRAL:
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case Sentiment.NEGATIVE:
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-300 text-xs">⇅</span>;
    return <span className="text-slate-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-lg transition-colors duration-300"
    >
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Employee Feedback Log</h4>
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search feedback text..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 transition-colors duration-300">
              <th
                className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-2">
                  <span>Date</span>
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('sentiment')}
              >
                <div className="flex items-center space-x-2">
                  <span>Sentiment</span>
                  <SortIcon field="sentiment" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('text')}
              >
                <div className="flex items-center space-x-2">
                  <span>Feedback Text</span>
                  <SortIcon field="text" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <motion.tr
                  key={item.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSentimentStyles(
                        item.sentiment
                      )}`}
                    >
                      {item.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 leading-relaxed font-medium">
                    {item.text}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No feedback found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-between rounded-b-lg gap-4 transition-colors duration-300">
        <p className="text-xs font-semibold text-slate-600">
          Showing <span className="text-slate-900">{sorted.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, sorted.length)}</span> of{' '}
          <span className="text-slate-900">{sorted.length}</span> entries
        </p>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-slate-600">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 border border-slate-200 rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 border border-slate-200 rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataTable;
