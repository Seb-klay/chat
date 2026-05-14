import { getSearchResults } from "../service";

export type ToolName = "search"; // | 'tool2' | tool3

export async function search(input: string): Promise<string> {
  try {
    const results = await getSearchResults(input);
    const data = await results?.json();

    if (data.results?.length === 0) {
      return "No results found.";
    }

    return data.results;
  } catch (error) {
    return "Search failed. Unable to retrieve results.";
  }
}

export const availableFunctions: Record<
  ToolName,
  (input: string) => Promise<string | undefined>
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
