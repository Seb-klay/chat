// components/SearchResultsDisplay.tsx
'use client';

import { SearxngSearchResult } from "searxng";
import SearchResultsDropdown from "../dropdowns/searchResultsDropdown";

interface SearchResultsDisplayProps {
  content: string;
  theme: any;
  isDark: boolean;
  isSearchError: (content: string) => boolean;
}

// Function to extract domain from URL
export const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch (e) {
    return url;
  }
};

// Function to get favicon URL
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    return "";
  }
};

  // Function to parse tool message content (which contains JSON array of SearxngSearchResult)
  const parseSearchResults = (content: string): SearxngSearchResult[] => {
    if (!content) return [];

    // If it's an error message (doesn't start with JSON format), return empty array
    if (
      content.startsWith("Error") ||
      content.startsWith("An error occurred")
    ) {
      return [];
    }

    try {
      const parsed: SearxngSearchResult[] = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

export default function SearchResultsDisplay({ 
  content, 
  theme, 
  isDark,
  isSearchError 
}: SearchResultsDisplayProps) {
  // Check if this is an error message
  if (isSearchError(content)) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
          <span>Search Error</span>
        </div>
        <div
          className={`w-full sm:w-1/2 md:w-1/3 p-4 rounded-lg border ${
            isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>
            {content}
          </p>
        </div>
      </div>
    );
  }

  // Parse search results
  const results = parseSearchResults(content);

  // If no results found
  if (results.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
          <span>Search Results</span>
        </div>
        <div
          className={`w-full sm:w-1/2 md:w-1/3 p-4 rounded-lg border`}
            style={{
              backgroundColor: theme.colors.tertiary_background,
              color: theme.colors.secondary,
            }}
        >
          <p className="text-sm">
            No results found.
          </p>
        </div>
      </div>
    );
  }

  // Display search results
  return (
    <div
      className="space-y-2"
      style={{
        color: theme.colors.secondary,
      }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <span>Search results</span>
        <span className="text-xs">({results.length})</span>
      </div>

      {/* Mobile: Inline chips (visible on sm and below) */}
      <div className="flex flex-wrap gap-1.5 md:hidden">
        {results.slice(0, 3).map((result: SearxngSearchResult, idx: number) => (
          <a
            key={idx}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors border text-gray-500 dark:text-gray-400"
            style={{
              backgroundColor: theme.colors.tertiary_background,
            }}
          >
            <img
              src={getFaviconUrl(result.url)}
              alt=""
              className="w-3 h-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="max-w-30 truncate">
              {result.title?.substring(0, 25) || getDomainFromUrl(result.url)}
            </span>
          </a>
        ))}
      </div>

      {/* Desktop/Tablet: Compact grid (visible on sm and above) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {results.slice(0, 3).map((result: SearxngSearchResult, idx: number) => (
          <a
            key={idx}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-2.5 border rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: theme.colors.tertiary_background,
            }}
          >
            <div className="flex items-start gap-2">
              <img
                src={getFaviconUrl(result.url)}
                alt=""
                className="w-4 h-4 mt-0.5 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getDomainFromUrl(result.url)}
                </div>

                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                  {result.title || "Untitled"}
                </h3>

                {result.content && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {result.content.substring(0, 80)}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* More results dropdown */}
      <SearchResultsDropdown
        results={results}
        onResultClick={(result: SearxngSearchResult) => {
          if (result.url) {
            window.open(result.url, "_blank", "noopener,noreferrer");
          }
        }}
        maxVisible={3}
        buttonText="more results"
        className="mt-2"
        theme={theme}
      />
    </div>
  );
}