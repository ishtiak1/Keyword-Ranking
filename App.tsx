
import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import DomainOverviewCard from './components/DomainOverviewCard';
import KeywordOverviewCard from './components/KeywordOverviewCard';
import HistorySidebar from './components/HistorySidebar';
import { generateSeoReport } from './services/geminiService';
import { AnalysisResult, DomainReport, KeywordReport, ReportType, HistoryItem } from './types';
import { LOCAL_STORAGE_HISTORY_KEY, MAX_HISTORY_ITEMS } from './constants';

const App: React.FC = () => {
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<ReportType>(ReportType.DOMAIN);


  // Function to check and select API key
  const checkAndSelectApiKey = useCallback(async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
      if (!selected) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } else {
      console.warn("window.aistudio is not available. Please ensure you are running in a compatible environment.");
      setHasApiKey(!!process.env.API_KEY);
    }
  }, []);

  // Load history from localStorage on initial mount
  useEffect(() => {
    checkAndSelectApiKey();
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistory);
        setHistory(parsedHistory);
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    }
  }, [checkAndSelectApiKey]);

  // Function to save a new report to history
  const saveReportToHistory = useCallback((newReport: AnalysisResult, query: string, type: ReportType) => {
    const historyItem: HistoryItem = {
      id: `${query}-${type}-${Date.now()}`,
      query,
      type,
      timestamp: Date.now(),
      report: newReport,
    };

    setHistory((prevHistory) => {
      const updatedHistory = [historyItem, ...prevHistory];
      if (updatedHistory.length > MAX_HISTORY_ITEMS) {
        updatedHistory.pop();
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save history to localStorage:', e);
      }
      return updatedHistory;
    });
    setActiveReportId(historyItem.id);
  }, []);

  const handleSearch = useCallback(async (query: string, type: ReportType) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setSearchQuery(query);
    setSearchType(type);
    setActiveReportId(null);

    try {
      if (!hasApiKey && window.aistudio) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
      
      const newReport = await generateSeoReport(query, type);
      setReport(newReport);
      saveReportToHistory(newReport, query, type);
    } catch (err: any) {
      console.error("Search failed:", err);
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError("API key might be invalid or needs to be re-selected. Please try again.");
        setHasApiKey(false);
      } else {
        setError(err.message || "An unknown error occurred during analysis.");
      }
    } finally {
      setLoading(false);
    }
  }, [hasApiKey, saveReportToHistory]);

  const onLoadHistoricalReport = useCallback((item: HistoryItem) => {
    setReport(item.report);
    setSearchQuery(item.query);
    setSearchType(item.type);
    setActiveReportId(item.id);
    setError(null);
  }, []);


  if (!hasApiKey && window.aistudio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Visibility - API Key Required</h1>
          <p className="text-gray-700 mb-6">
            To use AI Visibility, you need to select an API key from a paid GCP project.
          </p>
          <button
            onClick={checkAndSelectApiKey}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Select API Key
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Learn more about billing: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      </div>
    );
  }

  const currentReportTitle = report 
    ? `Visibility Overview: ${'domain' in report ? report.domain : report.keyword}` 
    : 'Visibility Overview';

  // Calculate dynamic conic-gradient for the AI Visibility Gauge
  const aiScore = report?.aiVisibilityScore ?? 0;
  const gradientFill = `${aiScore / 100 * 360}deg`;
  const gaugeBackground = `conic-gradient(#5D8CFE ${gradientFill}, #E0E7FF ${gradientFill})`;


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto max-w-7xl"> {/* Wider container */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <nav aria-label="Breadcrumb">
              <ol className="flex space-x-2">
                <li><a href="#" className="hover:text-blue-600">Home</a></li>
                <li><span className="mx-1">&gt;</span></li>
                <li><a href="#" className="hover:text-blue-600">AI Visibility</a></li>
                <li><span className="mx-1">&gt;</span></li>
                <li aria-current="page">Visibility Overview</li>
              </ol>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="flex items-center hover:text-blue-600">
                {/* Placeholder for icon */}
                <span className="mr-1">💬</span> Send feedback
              </button>
              <button className="flex items-center hover:text-blue-600">
                {/* Placeholder for icon */}
                <span className="mr-1">❓</span> How it works
              </button>
              <button className="flex items-center hover:text-blue-600">
                {/* Placeholder for icon */}
                <span className="mr-1">🖨️</span> Export to PDF
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pb-2">
            <h1 className="text-3xl font-bold text-gray-900">{currentReportTitle}</h1>
            {window.aistudio && (
              <button
                onClick={checkAndSelectApiKey}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm"
                title="Re-select your API key"
              >
                Change API Key
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Control Bar below header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm mb-4">
        <div className="container mx-auto max-w-7xl flex items-center space-x-4 text-sm">
          <button className="flex items-center px-3 py-1.5 rounded-md bg-gray-100 border border-gray-300 font-medium text-gray-700">
            {/* Placeholder for icon */}
            <span className="mr-1">🌍</span> Worldwide
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🇺🇸</span>
            <span className="text-xl">🇬🇧</span>
            <span className="text-xl">🇨🇦</span>
            <button className="px-2 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700">...</button>
          </div>
          <select className="p-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 appearance-none focus:ring-0 focus:outline-none">
            <option>All AI platforms</option>
            <option>Chat GPT</option>
            <option>Google AI Overview</option>
            <option>Gemini</option>
          </select>
        </div>
      </div>


      <main className="container mx-auto max-w-7xl p-4 flex flex-col md:flex-row gap-4">
        {/* Left Column: History and potentially other static elements */}
        <div className="md:w-1/4 flex flex-col gap-4">
          <HistorySidebar history={history} onLoadReport={onLoadHistoricalReport} currentActiveId={activeReportId} />
        </div>

        {/* Right Column: Main Content Area */}
        <div className="flex-grow flex flex-col gap-4">
          <SearchBar onSearch={handleSearch} isLoading={loading} initialQuery={searchQuery} initialType={searchType} />

          {loading && <LoadingSpinner />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-sm" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {!report && !loading && !error && (
            <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-600">
              <h2 className="text-2xl font-semibold mb-3">AI Visibility</h2>
              <p className="text-lg mb-2">Win Every Search: From Traditional SEO to AI Discovery</p>
              <p>Track your brand visibility, fix gaps, and grow across Google and AI search—all from one trusted platform.</p>
              <p className="mt-4">Start by entering a domain or keyword above.</p>
              <p className="text-sm text-gray-500 mt-2">Example: <span className="font-semibold text-blue-600">ai.google</span> or <span className="font-semibold text-blue-600">future of search</span></p>
            </div>
          )}

          {report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* AI Visibility Gauge */}
              <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <div className="relative w-36 h-36 flex items-center justify-center rounded-full"
                     style={{ background: gaugeBackground, boxShadow: '0 0 0 8px #fff, 0 0 0 10px #D6E4FF' }}>
                  <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-white flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-blue-700">{report.aiVisibilityScore}<span className="text-xl">/100</span></span>
                    <span className="text-md font-semibold text-blue-800">{report.aiVisibilityLevel}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 max-w-[150px]">
                  {report.aiVisibilityDescription}
                </p>
              </div>

              {/* Aggregated Metrics */}
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Monthly Audience</p>
                  <p className="text-3xl font-bold text-gray-900">86.2M</p>
                  <span className="text-red-500 text-sm font-medium">-1.3M</span> {/* Placeholder change */}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">LLM Mentions</p>
                  <p className="text-3xl font-bold text-blue-700">{report.llmMentions}</p>
                  <span className="text-green-500 text-sm font-medium">+3K</span> {/* Placeholder change */}
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Cited Pages in AI</p>
                  <p className="text-3xl font-bold text-blue-700">{report.citedPagesInAI}</p>
                  <span className="text-red-500 text-sm font-medium">-2.8K</span> {/* Placeholder change */}
                </div>
                <div className="col-span-2 mt-4 text-sm text-gray-700 space-y-2">
                  {/* These are static visual placeholders for now */}
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-700 mr-2"></span>Chat GPT: <span className="font-semibold ml-1">4.3K</span></p>
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Google AI Overview: <span className="font-semibold ml-1">6.6K</span></p>
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>AI Mode: <span className="font-semibold ml-1">4.7K</span></p>
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Gemini: <span className="font-semibold ml-1">4.4K</span></p>
                </div>
              </div>
            </div>
          )}

          {report && 'domain' in report && (
            <DomainOverviewCard report={report as DomainReport} />
          )}

          {report && 'keyword' in report && (
            <KeywordOverviewCard report={report as KeywordReport} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;