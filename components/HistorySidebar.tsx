
import React from 'react';
import { HistoryItem, ReportType } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onLoadReport: (item: HistoryItem) => void;
  currentActiveId: string | null;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onLoadReport, currentActiveId }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center h-48 border border-gray-200">
        <p className="text-lg text-gray-600 mb-2">No history yet.</p>
        <p className="text-sm text-gray-500">Your past reports will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Past Reports</h3>
      <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onLoadReport(item)}
              className={`block w-full text-left p-3 rounded-md transition-colors duration-200 border
                ${currentActiveId === item.id ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              aria-current={currentActiveId === item.id ? 'page' : undefined}
            >
              <p className="font-semibold text-base capitalize">
                {item.type === ReportType.DOMAIN ? 'Domain: ' : 'Keyword: '}
                <span className="break-words">{item.query}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </button>
          </li>
        ))}
      </ul>
      {/* Custom scrollbar style for better aesthetics (add to main CSS or inline) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0; /* Light gray track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* Gray-300 thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0; /* Gray-400 on hover */
        }
      `}</style>
    </div>
  );
};

export default HistorySidebar;