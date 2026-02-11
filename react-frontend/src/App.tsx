
import React, { useState, useEffect } from 'react';
import { FeedbackRecord, Sentiment, DateRange } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CompanySelector from './components/CompanySelector';
import ChartsSection from './components/ChartsSection';
import ComparisonSection from './components/ComparisonSection';
import InsightsPanel from './components/InsightsPanel';
import DataTable from './components/DataTable';
import KpiSummary from './components/KpiSummary';
import TrendAnalysis from './components/TrendAnalysis';
import KeyInsights from './components/KeyInsights';
import SentimentComparison from './components/SentimentComparison';
import VaderSentimentCard from './components/VaderSentimentCard';
import DriftDetectionAlerts from './components/DriftDetectionAlerts';
import { fetchData, fetchDateRange, checkHealth } from './api/client';

const AppContent: React.FC = () => {
  console.log('App component loaded');
  // State
  const [selectedCompany, setSelectedCompany] = useState<string>('microsoft');
  const [filteredData, setFilteredData] = useState<FeedbackRecord[]>([]);
  const [allData, setAllData] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>([
    Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE
  ]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-01-05',  // Will be updated after loading from API
    end: '2024-05-30'     // Will be updated after loading from API
  });
  const [minDate, setMinDate] = useState<string>('');
  const [maxDate, setMaxDate] = useState<string>('');

  // Load date range on mount and when company changes
  useEffect(() => {
    const loadDateRange = async () => {
      try {
        const response = await fetchDateRange(selectedCompany);
        setMinDate(response.minDate);
        setMaxDate(response.maxDate);
        // Update initial date range if needed
        setDateRange(prev => ({
          ...prev,
          start: response.minDate,
          end: response.maxDate
        }));
      } catch (err) {
        console.error('Failed to load date range:', err);
      }
    };

    loadDateRange();
  }, [selectedCompany]);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sentimentStrings = selectedSentiments.map(s => 
          s === Sentiment.POSITIVE ? 'POSITIVE' : 
          s === Sentiment.NEUTRAL ? 'NEUTRAL' : 'NEGATIVE'
        );

        const response = await fetchData(
          sentimentStrings, 
          dateRange.start, 
          dateRange.end,
          selectedCompany
        );
        
        // Convert API response to FeedbackRecord format
        const records: FeedbackRecord[] = response.data.map((item: any) => ({
          id: item.id,
          text: item.text,
          createdAt: item.createdAt,
          sentiment: (
            item.sentiment === 'POSITIVE' ? Sentiment.POSITIVE :
            item.sentiment === 'NEUTRAL' ? Sentiment.NEUTRAL : Sentiment.NEGATIVE
          ),
          company: item.company
        }));

        setFilteredData(records);
        setAllData(records); // Store all data for comparison section
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (dateRange.start && dateRange.end) {
      loadData();
    }
  }, [selectedSentiments, dateRange, selectedCompany]);

  // Export CSV helper
  const exportCsv = (records: FeedbackRecord[]) => {
    if (!records || records.length === 0) return;
    const header = ['id', 'text', 'createdAt', 'sentiment', 'company'];
    const rows = records.map(r => [r.id, '"' + (r.text || '').replace(/"/g, '""') + '"', r.createdAt, r.sentiment, r.company || selectedCompany]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${selectedCompany}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const positiveCount = filteredData.filter(d => d.sentiment === Sentiment.POSITIVE).length;
  const neutralCount = filteredData.filter(d => d.sentiment === Sentiment.NEUTRAL).length;
  const negativeCount = filteredData.filter(d => d.sentiment === Sentiment.NEGATIVE).length;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      <Header onExport={() => exportCsv(filteredData)} />
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 text-red-800 dark:text-red-200">
          <p className="text-sm font-medium">Error: {error}</p>
          <p className="text-xs mt-1">Make sure the Flask API server is running on http://localhost:5000</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center flex-1 pt-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="flex flex-1 pt-16">
          {/* Sticky Sidebar */}
          <Sidebar 
            selectedSentiments={selectedSentiments}
            setSelectedSentiments={setSelectedSentiments}
            dateRange={dateRange}
            setDateRange={setDateRange}
            allDataCount={allData.length}
            filteredCount={filteredData.length}
            minDate={minDate}
            maxDate={maxDate}
          />

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
            {/* Company Selector */}
            <CompanySelector 
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
            />
            
            {/* VADER Sentiment Card - Highlighted Component */}
            <VaderSentimentCard 
              positiveCount={positiveCount}
              neutralCount={neutralCount}
              negativeCount={negativeCount}
              total={filteredData.length}
            />

            {/* Drift Detection Alerts - Highlighted Component */}
            <DriftDetectionAlerts 
              data={filteredData}
              dateRange={dateRange}
            />

            {/* New KPI Summary */}
            <KpiSummary data={filteredData} />
            
            {/* Original Insights Panel */}
            <InsightsPanel data={filteredData} allData={allData} />
            
            {/* New Key Insights */}
            <KeyInsights data={filteredData} allData={allData} dateRange={dateRange} />
            
            {/* New Trend Analysis */}
            <TrendAnalysis data={filteredData} dateRange={dateRange} />
            
            {/* New Sentiment Comparison */}
            <SentimentComparison data={filteredData} allData={allData} dateRange={dateRange} />

            {/* Original Charts Section */}
            <ChartsSection data={filteredData} />

            {/* Original Comparison Section */}
            <ComparisonSection allData={allData} currentData={filteredData} />

            {/* Enhanced Data Table with Sorting */}
            <DataTable data={filteredData} />
          </main>
        </div>
      )}
    </div>
  );
};

export default AppContent;
