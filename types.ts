
export interface KeywordReport {
  keyword: string;
  searchVolume: string; // e.g., "100K"
  keywordDifficulty: string; // e.g., "75%"
  relatedKeywords: { keyword: string; volume: string }[];
  serpFeatures: string[]; // e.g., ["Featured Snippet", "People Also Ask"]
  summary: string;
  // New AI Overview fields
  aiSnippetInclusionRate: string; // e.g., "25%"
  prominentAiKeywords: string[]; // Keywords frequently associated with the content in AI responses
  aiSentimentAnalysis: string; // e.g., "Positive", "Neutral", "Negative"
  llmMentions: string; // Aggregate mentions across LLMs, e.g., "20.1K"
  citedPagesInAI: string; // Aggregate cited pages in AI responses, e.g., "7.1K"
  aiVisibilityScore: number; // e.g., 55 (out of 100)
  aiVisibilityLevel: string; // e.g., "Medium"
  aiVisibilityDescription: string; // e.g., "Occasionally mentioned in LLM outputs, but Visibility can improve."
}

export interface DomainReport {
  domain: string;
  organicSearchTraffic: string; // e.g., "1.2M"
  organicKeywords: string; // e.g., "500K"
  referringDomains: string; // e.g., "12K"
  topOrganicKeywords: { keyword: string; volume: string; position: number }[];
  topCompetitors: { domain: string; commonKeywords: string }[];
  summary: string;
  // New AI Overview fields
  aiSnippetInclusionRate: string; // e.g., "25%"
  prominentAiKeywords: string[]; // Keywords frequently associated with the content in AI responses
  aiSentimentAnalysis: string; // e.g., "Positive", "Neutral", "Negative"
  llmMentions: string; // Aggregate mentions across LLMs, e.g., "20.1K"
  citedPagesInAI: string; // Aggregate cited pages in AI responses, e.g., "7.1K"
  aiVisibilityScore: number; // e.g., 55 (out of 100)
  aiVisibilityLevel: string; // e.g., "Medium"
  aiVisibilityDescription: string; // e.g., "Occasionally mentioned in LLM outputs, but Visibility can improve."
}

export type AnalysisResult = KeywordReport | DomainReport;

export enum ReportType {
  KEYWORD = 'KEYWORD',
  DOMAIN = 'DOMAIN',
  UNKNOWN = 'UNKNOWN',
}

export interface HistoryItem {
  id: string; // Unique ID for each history item
  query: string;
  type: ReportType;
  timestamp: number; // Unix timestamp
  report: AnalysisResult;
}