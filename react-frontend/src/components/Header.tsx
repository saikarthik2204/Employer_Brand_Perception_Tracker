import React, { useEffect, useState } from 'react';

interface HeaderProps {
  onExport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-3 border-slate-200 dark:border-slate-700' 
          : 'bg-white dark:bg-slate-900 py-4 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Employee Brand Perception Dashboard
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            System Live
          </span>
          <button
            onClick={() => onExport && onExport()}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            Export Report
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
