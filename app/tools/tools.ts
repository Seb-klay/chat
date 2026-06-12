import { SearxngSearchResult } from "searxng";
import { getSearchResults } from "../service";

export type ToolName = "search"; // | 'tool2' | tool3

export async function search(input: string): Promise<{ results: SearxngSearchResult[]; error?: string }> {
  try {
    const results = await getSearchResults(input);

    if (!results) {
      return { results: [], error: "No response received from the search engine." };
    }

    if (!results.ok) {
      console.log(results)
      return { results: [], error: `Search upstream error (HTTP ${results.status}).` };
    }

    const data = await results?.json();

    if (!data.results || data.results?.length === 0) {
      return { results: [], error: "No results found for the given query." };
    }
    
    const res: SearxngSearchResult[] = data.results;
    
    return { results: res };
  } catch (error) {
    return { results: [], error: "An error occurred while fetching search results." };
  }
}

export const availableFunctions: Record<
  ToolName,
  (input: string) => Promise<{ results: SearxngSearchResult[]; error?: string; } | undefined>
> = {
  search,
};

export const tools = [
  {
    type: "function",
    function: {
      name: "search",
      description: "search on the internet using meta-search engine tool",
      parameters: {
        type: "object",
        properties: {
          input: { type: "string", description: "The search query" },
        },
      },
      required: ["input"],
    },
  },
];
