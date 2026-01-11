
import React from 'react';
import { KeywordReport } from '../types';
import { parseVolumeString } from '../services/geminiService';

interface KeywordOverviewCardProps {
  report: KeywordReport;
}

const KeywordOverviewCard: React.FC<KeywordOverviewCardProps> = ({ report }) => {
  const maxRelatedKeywordVolume = Math.max(
    ...report.relatedKeywords.map((k) => parseVolumeString(k.volume)),
    1 // Ensure at least 1 for division
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6" aria-labelledby="keyword-overview-title">
      <h2 id="keyword-overview-title" className="text-2xl font-bold text-gray-900 mb-6">{report.keyword} Report</h2>
      <p className="text-gray-700 mb-8">{report.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border border-gray-200 rounded-md flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Search Volume</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{report.searchVolume}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-md flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Keyword Difficulty</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{report.keywordDifficulty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Keywords</h3>
          {report.relatedKeywords.length > 0 ? (
            <div className="space-y-3">
              {report.relatedKeywords
                .sort((a, b) => parseVolumeString(b.volume) - parseVolumeString(a.volume))
                .map((item, index) => {
                  const volume = parseVolumeString(item.volume);
                  const width = (volume / maxRelatedKeywordVolume) * 100;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-grow relative h-8 bg-gray-100 rounded-md overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-green-500 opacity-80" style={{ width: `${width}%` }} aria-hidden="true"></div>
                        <div className="relative flex justify-between items-center h-full px-3 text-sm z-10">
                          <span className="font-medium text-gray-800 truncate">{item.keyword}</span>
                          <span className="text-gray-700 font-medium ml-2 flex-shrink-0" aria-label={`Volume: ${item.volume}`}>{item.volume}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500">No related keywords found.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">SERP Features</h3>
          {report.serpFeatures.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label="SERP Features">
              {report.serpFeatures.map((feature, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-200 shadow-sm" aria-label={`SERP Feature: ${feature}`}>
                  {feature}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No prominent SERP features found.</p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Overview Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-500">AI Snippet Inclusion Rate</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{report.aiSnippetInclusionRate}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-md col-span-2">
            <p className="text-sm font-medium text-gray-500 mb-2">Prominent AI Keywords</p>
            {report.prominentAiKeywords && report.prominentAiKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.prominentAiKeywords.map((keyword, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No prominent AI keywords identified.</p>
            )}
          </div>
          <div className="p-4 border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-500">AI Sentiment Analysis</p>
            <span className={`inline-block text-lg font-semibold mt-1 px-3 py-1 rounded-full ${getSentimentColor(report.aiSentimentAnalysis)}`}>
              {report.aiSentimentAnalysis}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordOverviewCard;