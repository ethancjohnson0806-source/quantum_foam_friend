/**
 * Web search integration for temple curiosity spikes
 * Uses Manus built-in data API for searching
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || "http://localhost:3000";
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY || "";

  try {
    const response = await fetch(`${apiUrl}/v1/data/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    });

    if (!response.ok) {
      console.error(`Search API error: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error("Web search failed:", err);
    return [];
  }
}

/**
 * Synthesize search results into quantum noise vector
 * Higher relevance = stronger noise component
 */
export function synthesizeSearchNoise(results: SearchResult[]): number[] {
  const noise = new Array(64).fill(0);

  if (results.length === 0) {
    return noise;
  }

  // Weight each result by position (first result has highest weight)
  results.forEach((result, idx) => {
    const weight = (results.length - idx) / results.length;
    const textHash = hashText(result.title + result.snippet);

    for (let i = 0; i < 64; i++) {
      const byte = textHash[i % textHash.length] || 0;
      noise[i] += ((byte / 255) * weight * 0.3);
    }
  });

  // Normalize
  const max = Math.max(...noise);
  if (max > 0) {
    return noise.map((n) => n / max);
  }

  return noise;
}

/**
 * Simple text hash for reproducibility
 */
function hashText(text: string): number[] {
  const hash = [];
  for (let i = 0; i < 64; i++) {
    let sum = 0;
    for (let j = 0; j < text.length; j++) {
      sum += text.charCodeAt(j) * (i + 1);
    }
    hash.push(sum % 256);
  }
  return hash;
}
