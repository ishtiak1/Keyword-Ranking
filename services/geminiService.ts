
import { GoogleGenAI, Type } from "@google/genai";
import { DomainReport, KeywordReport, ReportType } from "../types";
import { GEMINI_MODEL_NAME } from "../constants";

// Helper function to decode base64 for Live API, not used here, but good to have a consistent structure
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for image processing, not used here
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read blob as base64 string."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Utility to parse volume strings like "10K", "1.2M" to numbers
export const parseVolumeString = (volumeStr: string): number => {
  if (!volumeStr) return 0;
  const cleanedStr = volumeStr.toUpperCase().replace(/,/g, '');
  if (cleanedStr.endsWith('K')) {
    return parseFloat(cleanedStr) * 1000;
  }
  if (cleanedStr.endsWith('M')) {
    return parseFloat(cleanedStr) * 1000000;
  }
  return parseInt(cleanedStr) || 0;
};

export const generateSeoReport = async (
  query: string,
  reportType: ReportType
): Promise<DomainReport | KeywordReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let prompt: string;
  let responseSchema: any;

  // Common AI Overview properties and requirements
  const aiOverviewProperties = {
    aiSnippetInclusionRate: { type: Type.STRING, description: 'Percentage of times content is used in AI snippets, e.g., "25%".' },
    prominentAiKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Keywords frequently associated with the content in AI responses.' },
    aiSentimentAnalysis: { type: Type.STRING, description: 'Overall sentiment of AI-generated responses (e.g., "Positive", "Neutral", "Negative").' },
    llmMentions: { type: Type.STRING, description: 'Aggregate mentions across LLMs, e.g., "20.1K".' },
    citedPagesInAI: { type: Type.STRING, description: 'Aggregate cited pages in AI responses, e.g., "7.1K".' },
    aiVisibilityScore: { type: Type.NUMBER, description: 'A numerical AI visibility score out of 100, e.g., 55.' },
    aiVisibilityLevel: { type: Type.STRING, description: 'Categorical AI visibility level (e.g., "Low", "Medium", "High").' },
    aiVisibilityDescription: { type: Type.STRING, description: 'A brief description for the AI visibility score.' },
  };
  const aiOverviewRequired = [
    'aiSnippetInclusionRate',
    'prominentAiKeywords',
    'aiSentimentAnalysis',
    'llmMentions',
    'citedPagesInAI',
    'aiVisibilityScore',
    'aiVisibilityLevel',
    'aiVisibilityDescription',
  ];


  if (reportType === ReportType.DOMAIN) {
    prompt = `Act as an AI Visibility expert providing a comprehensive report for the domain '${query}'. Generate a JSON object with the following structure, including metrics for traditional SEO and Google AI Overview. Invent realistic data if you don't have real-time access, ensuring varied sentiment and keyword data. Focus on a brief summary of the domain's AI and traditional search performance.`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        domain: { type: Type.STRING, description: 'The analyzed domain.' },
        organicSearchTraffic: { type: Type.STRING, description: 'Estimated monthly organic search traffic, e.g., "1.2M".' },
        organicKeywords: { type: Type.STRING, description: 'Number of keywords the domain ranks for organically, e.g., "500K".' },
        referringDomains: { type: Type.STRING, description: 'Number of unique domains linking to this domain, e.g., "12K".' },
        topOrganicKeywords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING, description: 'A top organic keyword.' },
              volume: { type: Type.STRING, description: 'Monthly search volume for the keyword, e.g., "10K".' },
              position: { type: Type.NUMBER, description: 'Ranking position for the keyword.' },
            },
            required: ['keyword', 'volume', 'position'],
          },
          description: 'List of top organic keywords with their volume and position.',
        },
        topCompetitors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              domain: { type: Type.STRING, description: 'A top competitor domain.' },
              commonKeywords: { type: Type.STRING, description: 'Number of common keywords with the analyzed domain, e.g., "20K".' },
            },
            required: ['domain', 'commonKeywords'],
          },
          description: 'List of top competitors with shared keywords.',
        },
        summary: { type: Type.STRING, description: 'A brief summary of the domain\'s SEO performance.' },
        ...aiOverviewProperties, // Include AI Overview properties
      },
      required: [
        'domain',
        'organicSearchTraffic',
        'organicKeywords',
        'referringDomains',
        'topOrganicKeywords',
        'topCompetitors',
        'summary',
        ...aiOverviewRequired, // Include AI Overview required fields
      ],
    };
  } else if (reportType === ReportType.KEYWORD) {
    prompt = `Act as an AI Visibility expert providing a comprehensive report for the keyword '${query}'. Generate a JSON object with the following structure, including metrics for traditional SEO and Google AI Overview. Invent realistic data if you don't have real-time access, ensuring varied sentiment and keyword data. Focus on a brief summary of the keyword's potential for AI and traditional search discovery.`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING, description: 'The analyzed keyword.' },
        searchVolume: { type: Type.STRING, description: 'Estimated monthly global search volume, e.g., "100K".' },
        keywordDifficulty: { type: Type.STRING, description: 'Keyword difficulty score as a percentage, e.g., "75%".' },
        relatedKeywords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING, description: 'A related keyword.' },
              volume: { type: Type.STRING, description: 'Monthly search volume for the related keyword, e.g., "5K".' },
            },
            required: ['keyword', 'volume'],
          },
          description: 'List of related keywords with their search volume.',
        },
        serpFeatures: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of prominent SERP features for this keyword, e.g., ["Featured Snippet", "People Also Ask"].',
        },
        summary: { type: Type.STRING, description: 'A brief summary of the keyword\'s search potential.' },
        ...aiOverviewProperties, // Include AI Overview properties
      },
      required: [
        'keyword',
        'searchVolume',
        'keywordDifficulty',
        'relatedKeywords',
        'serpFeatures',
        'summary',
        ...aiOverviewRequired, // Include AI Overview required fields
      ],
    };
  } else {
    throw new Error('Invalid report type specified.');
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }, // Allow a decent thinking budget
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error('Gemini API returned an empty response.');
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate report. Please try again.');
  }
};