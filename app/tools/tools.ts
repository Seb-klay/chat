import { getSearchResults } from "../service";

export type ToolName = 'search' // | 'tool2' | tool3

export async function search(input: string): Promise<string> {
  try {
    const results = await getSearchResults(input);

    if (!results) {
      return "No results found.";
    }
    const data = await results.text(); 

    return `Search results:\n${data}`;
  } catch (error) {
    console.error("Search failed:", error);

    return "Search failed. Unable to retrieve results.";
  }
}

export const availableFunctions : Record<ToolName, (input: string) => Promise<string | undefined> > = {
    search
}

export const tools = [
    {
        type: 'function',
        function: {
            name: 'search',
            description: 'search on the internet using meta-search engine tool',
            parameters: {
                type: 'object',
                required: ['input'],
                properties: {
                    input: { type: 'string', description: 'The search query' },
                },
            },
        },
    },
]