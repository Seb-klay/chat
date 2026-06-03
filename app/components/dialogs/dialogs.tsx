import { IMessage } from "@/app/utils/chatUtils";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import { CodeBlock } from "./codeBlock";
import { useTheme } from "../contexts/theme-provider";
import {
  handleFileDownload,
  formatFileSize,
  FileIcon,
} from "@/app/utils/fileUtils";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { SearxngSearchResult } from "searxng";

interface DialogProps {
  messages: IMessage[];
}

const Dialogs: React.FC<DialogProps> = ({ messages }) => {
  const { theme } = useTheme();

  // Function to parse tool message content (which contains JSON array of SearxngSearchResult)
  const parseSearchResults = (content: string): SearxngSearchResult[] => {
    if (!content) return [];

    // If it's an error message (doesn't start with JSON format), return empty array
    if (content.startsWith("Error") || content.startsWith("An error occurred")) {
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

  // Function to check if the tool message contains an error
  const isSearchError = (content: string): boolean => {
    return (
      content?.startsWith("An error occurred")
    );
  };

  // Function to format the date
  const formatDate = (dateString?: Date | null): string => {
    if (!dateString) return "Date unavailable";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Function to extract domain from URL
  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch (e) {
      return url;
    }
  };

  // Function to get favicon URL
  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
      return "";
    }
  };

  return (
    <div className=" space-y-2 bg-transparent rounded-lg">
      {messages
        .filter((m) => m.role !== "system")
        .map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              style={{
                backgroundColor:
                  m.role === "user"
                    ? theme.colors.background_second
                    : "transparent",
              }}
              className="max-w-xs md:max-w-xl px-4 py-2 rounded-lg mt-3 md:mt-6 mb-3 md:mb-6"
            >
              {/* Display files if they exist */}
              {m.files && m.files.length > 0 && (
                <div className="mb-3 space-y-2">
                  {m.files.map((file, fileIndex) => (
                    <div
                      key={file.id || fileIndex}
                      className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
                    >
                      {/* File icon based on type */}
                      <FileIcon fileType={file.type} />

                      {/* File details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {/* Optional: Download button */}
                      {file?.id && !file.isdeleted && (
                        <button
                          onClick={() =>
                            handleFileDownload({
                              fileName: file.name,
                              fileId: file?.id,
                            })
                          }
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Download file"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Handle tool role messages differently */}
              {m.role === "tool" ? (
                (() => {
                  // Check if this is an error message
                  if (isSearchError(m.content)) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                          <span>⚠️</span>
                          <span>Search Error</span>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {m.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Parse search results
                  const results = parseSearchResults(m.content);

                  // If no results found
                  if (results.length === 0) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                          <span>🔍</span>
                          <span>Search Results</span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No results found.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Display search results
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        <span>🔍</span>
                        <span>Search Results</span>
                        <span className="text-xs text-gray-400">
                          ({results.length} results)
                        </span>
                      </div>
                      <div className="space-y-3">
                        {results.map((result, idx) => (
                          <a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
                          >
                            <div className="flex items-start gap-3">
                              {/* Favicon */}
                              <img
                                src={getFaviconUrl(result.url)}
                                alt=""
                                className="w-5 h-5 mt-0.5 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />

                              <div className="flex-1 min-w-0">
                                {/* Domain and date row */}
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {getDomainFromUrl(result.url)}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                    {formatDate(result.publishedDate)}
                                  </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 line-clamp-2">
                                  {result.title || "Untitled"}
                                </h3>

                                {/* Content preview */}
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                                  {result.content ? (
                                    <>
                                      {result.content.substring(0, 200)}
                                      {result.content.length > 200 ? "..." : ""}
                                    </>
                                  ) : (
                                    "No content available"
                                  )}
                                </p>

                                {/* Engine and score badges */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {result.engine && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {result.engine}
                                    </span>
                                  )}
                                  {result.score && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                      Score: {Math.round(result.score * 100)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <ReactMarkdown
                  remarkPlugins={[gfm as any]}
                  rehypePlugins={[raw as any]}
                  components={{
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <CodeBlock
                          language={match[1]}
                          value={String(children).replace(/\n$/, "")}
                        />
                      ) : (
                        <code
                          className="bg-secondary-foreground text-secondary px-1 rounded-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p: ({ node, ...props }) => (
                      <p className="whitespace-pre-wrap" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="-mt-1 list-disc space-y-2 pl-8"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="-mt-1 list-decimal space-y-2 pl-8"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        className="whitespace-normal wrap-break-word"
                        {...props}
                      />
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Dialogs;
