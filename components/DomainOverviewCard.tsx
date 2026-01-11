
import React from 'react';
import { DomainReport } from '../types';
import { parseVolumeString } from '../services/geminiService';

interface DomainOverviewCardProps {
  report: DomainReport;
}

const DomainOverviewCard: React.FC<DomainOverviewCardProps> = ({ report }) => {
  const maxKeywordVolume = Math.max(
    ...report.topOrganicKeywords.map((k) => parseVolumeString(k.volume)),
    1 // Ensure at least 1 for division
  );

  const totalCommonKeywords = report.topCompetitors.reduce(
    (sum, comp) => sum + parseVolumeString(comp.commonKeywords),
    0
  );

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500'];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6" aria-labelledby="domain-overview-title">
      <h2 id="domain-overview-title" className="text-2xl font-bold text-gray-900 mb-6">{report.domain} Report</h2>
      <p className="text-gray-700 mb-8">{report.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 border border-gray-200 rounded-md flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Organic Search Traffic</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{report.organicSearchTraffic}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-md flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Organic Keywords</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{report.organicKeywords}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-md flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Referring Domains</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{report.referringDomains}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Organic Keywords</h3>
          {report.topOrganicKeywords.length > 0 ? (
            <div className="space-y-3">
              {report.topOrganicKeywords
                .sort((a, b) => parseVolumeString(b.volume) - parseVolumeString(a.volume))
                .map((item, index) => {
                  const volume = parseVolumeString(item.volume);
                  const width = (volume / maxKeywordVolume) * 100;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-8 text-sm text-gray-500">#{item.position}</span>
                      <div className="flex-grow relative h-8 bg-gray-100 rounded-md overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-blue-500 opacity-80" style={{ width: `${width}%` }} aria-hidden="true"></div>
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
            <p className="text-gray-500">No top organic keywords found.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Competitors</h3>
          {report.topCompetitors.length > 0 && totalCommonKeywords > 0 ? (
            <div className="space-y-4">
              {/* Proportional Stacked Bar */}
              <div className="flex w-full h-8 rounded-md overflow-hidden shadow-inner mb-4" role="img" aria-label="Competitors' common keywords distribution">
                {report.topCompetitors
                  .sort((a, b) => parseVolumeString(b.commonKeywords) - parseVolumeString(a.commonKeywords))
                  .map((item, index) => {
                    const commonKeywordsNum = parseVolumeString(item.commonKeywords);
                    const percentage = (commonKeywordsNum / totalCommonKeywords) * 100;
                    return (
                      <div
                        key={index}
                        className={`${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-bold`}
                        style={{ width: `${percentage}%` }}
                        title={`${item.domain}: ${item.commonKeywords} common keywords (${percentage.toFixed(1)}%)`}
                        aria-label={`${item.domain} accounts for ${percentage.toFixed(1)}% of common keywords`}
                      >
                        {percentage > 5 && `${percentage.toFixed(0)}%`}
                      </div>
                    );
                  })}
              </div>
              {/* Detailed List */}
              <div className="space-y-2">
                {report.topCompetitors
                  .sort((a, b) => parseVolumeString(b.commonKeywords) - parseVolumeString(a.commonKeywords))
                  .map((item, index) => {
                    const commonKeywordsNum = parseVolumeString(item.commonKeywords);
                    const percentage = (commonKeywordsNum / totalCommonKeywords) * 100;
                    return (
                      <div key={index} className="flex justify-between items-center py-2 px-3 rounded-md border border-gray-100">
                        <span className="font-medium text-gray-800">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${colors[index % colors.length]}`} aria-hidden="true"></span>
                          {item.domain}
                        </span>
                        <span className="text-sm text-gray-600" aria-label={`${item.commonKeywords} common keywords`}>
                          {item.commonKeywords} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No top competitors found.</p>
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

export default DomainOverviewCard;