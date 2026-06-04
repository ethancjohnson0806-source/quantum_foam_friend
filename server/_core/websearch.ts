import { ENV } from './env';

/**
 * Real web search integration
 * Supports both Manus built-in search and optional SerpAPI
 */

interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
}

/**
 * Search using Manus built-in Data API
 */
async function searchWithManus(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/v1/data_api/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    });

    if (!response.ok) {
      console.warn(`Manus search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Parse Manus response format
    if (Array.isArray(data.results)) {
      return data.results.map((r: any) => ({
        title: r.title || r.name || 'Untitled',
        snippet: r.snippet || r.description || r.content || '',
        url: r.url || r.link || '',
      }));
    }

    return [];
  } catch (error) {
    console.warn('Manus search error:', error);
    return [];
  }
}

/**
 * Search using SerpAPI (optional - requires API key)
 */
async function searchWithSerpAPI(query: string): Promise<SearchResult[]> {
  const serpApiKey = process.env.SERPAPI_KEY;
  
  if (!serpApiKey) {
    return [];
  }

  try {
    const response = await fetch('https://serpapi.com/search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const params = new URLSearchParams({
      q: query,
      api_key: serpApiKey,
      num: '5',
    });

    const serpResponse = await fetch(`https://serpapi.com/search?${params}`, {
      method: 'GET',
    });

    if (!serpResponse.ok) {
      console.warn(`SerpAPI search failed: ${serpResponse.status}`);
      return [];
    }

    const data = await serpResponse.json();

    // Parse SerpAPI response format
    if (data.organic_results && Array.isArray(data.organic_results)) {
      return data.organic_results.map((r: any) => ({
        title: r.title || 'Untitled',
        snippet: r.snippet || '',
        url: r.link || '',
      }));
    }

    return [];
  } catch (error) {
    console.warn('SerpAPI search error:', error);
    return [];
  }
}

/**
 * Combined search: try both Manus and SerpAPI, merge results
 */
export async function performRealWebSearch(query: string): Promise<SearchResult[]> {
  try {
    // Search with both sources in parallel
    const [manusResults, serpResults] = await Promise.all([
      searchWithManus(query),
      searchWithSerpAPI(query),
    ]);

    // Combine and deduplicate results
    const allResults = [...manusResults, ...serpResults];
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of allResults) {
      const key = `${result.title}|${result.snippet}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    // Return top 10 combined results
    return unique.slice(0, 10);
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

/**
 * Format search results as readable text for LLM synthesis
 */
export function formatSearchResults(results: SearchResult[]): string[] {
  return results.map(r => {
    const parts = [];
    if (r.title) parts.push(`Title: ${r.title}`);
    if (r.snippet) parts.push(`Content: ${r.snippet}`);
    if (r.url) parts.push(`Source: ${r.url}`);
    return parts.join(' | ');
  });
}
