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
import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { SearxngSearchResult } from "searxng";

interface DialogProps {
  messages: IMessage[];
  onInfo: (info: string) => void;
}

const Dialogs: React.FC<DialogProps> = ({ messages, onInfo }) => {
  const { theme, mode } = useTheme();
  const isDark = mode === "dark";

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

  // Function to check if the tool message contains an error
  const isSearchError = (content: string): boolean => {
    return content?.startsWith("An error occurred");
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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);

    onInfo(`Message successfully copied.`);
  };

  const handleRetry = (message: IMessage) => {
    // Regenerate the assistant's response
    // Your logic here
  };

  return (
    <div className="space-y-2 bg-transparent rounded-lg">
      {messages
        .filter((m) => m.role !== "system")
        .map((m, i) => (
          <div key={i} className="flex flex-col">
            <div
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
                className={`
                  px-6 py-2 rounded-lg mt-3 md:mt-6 
                  ${m.role === "user" ? "max-w-xl" : "w-full"}
                  ${m.role === "tool" ? "mb-0" : "mb-3 md:mb-6"}
                  overflow-hidden
                `}
              >
                {/* Display files if they exist */}
                {m.files && m.files.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {m.files.map((file, fileIndex) => (
                      <div
                        key={file.id || fileIndex}
                        className="flex items-center gap-2 p-2 rounded-md text-sm"
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
                            <ArrowDownTrayIcon className="w-5 h-5" />
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
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <span>Search Error</span>
                          </div>
                          <div
                            className={`w-full sm:w-1/2 md:w-1/3 p-4 rounded-lg border ${isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}
                          >
                            <p
                              className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}
                            >
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
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <span>Search Results</span>
                          </div>
                          <div
                            className={`w-full sm:w-1/2 md:w-1/3 p-4 rounded-lg border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                          >
                            <p
                              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            >
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
                          {results.slice(0, 5).map((result, idx) => (
                            <a
                              key={idx}
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors border text-gray-500 dark:text-gray-400"
                              style={{
                                backgroundColor:
                                  theme.colors.tertiary_background,
                              }}
                            >
                              <img
                                src={getFaviconUrl(result.url)}
                                alt=""
                                className="w-3 h-3"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                              <span className="max-w-30 truncate">
                                {result.title?.substring(0, 25) ||
                                  getDomainFromUrl(result.url)}
                              </span>
                            </a>
                          ))}
                          {results.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs">
                              +{results.length - 5}
                            </span>
                          )}
                        </div>

                        {/* Desktop/Tablet: Compact grid (visible on sm and above) */}
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {results.slice(0, 6).map((result, idx) => (
                            <a
                              key={idx}
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block p-2.5 border rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                              style={{
                                backgroundColor:
                                  theme.colors.tertiary_background,
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <img
                                  src={getFaviconUrl(result.url)}
                                  alt=""
                                  className="w-4 h-4 mt-0.5 shrink-0"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
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

                        {/* Optional: "More results" button for desktop */}
                        {results.length > 6 && (
                          <div className="hidden sm:block">
                            <button
                              onClick={() => {
                                // Handle showing more results
                                const container = document.querySelector(
                                  ".desktop-search-grid",
                                );
                                if (container) {
                                  // Your expand logic here
                                }
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              +{results.length - 6} more results
                            </button>
                          </div>
                        )}
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

            {/* Buttons at the bottom of the bubble */}
            {m.role !== "tool" && (
              <div
                className={`flex gap-1 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex gap-1">
                  <button
                    onClick={() => handleCopy(m.content)}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors opacity-70 hover:opacity-100"
                    title="Copy"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => handleRetry(m)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors opacity-70 hover:opacity-100"
                      title="Regenerate"
                    >
                      <ArrowPathIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Dialogs;
