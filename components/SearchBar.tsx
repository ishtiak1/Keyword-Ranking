
import React, { useState, useEffect } from 'react';
import { ReportType } from '../types';

interface SearchBarProps {
  onSearch: (query: string, type: ReportType) => void;
  isLoading: boolean;
  initialQuery?: string;
  initialType?: ReportType;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, initialQuery = '', initialType = ReportType.DOMAIN }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedType, setSelectedType] = useState<ReportType>(initialType);

  useEffect(() => {
    setQuery(initialQuery);
    setSelectedType(initialType);
  }, [initialQuery, initialType]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), selectedType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 p-4 bg-white shadow-sm rounded-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter domain (e.g., ai.google) or keyword (e.g., future of search)"
        className="flex-grow p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder-gray-400"
        disabled={isLoading}
      />
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as ReportType)}
        className="p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-700 appearance-none"
        disabled={isLoading}
      >
        <option value={ReportType.DOMAIN}>Domain Analysis</option>
        <option value={ReportType.KEYWORD}>Keyword Analysis</option>
      </select>
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};

export default SearchBar;