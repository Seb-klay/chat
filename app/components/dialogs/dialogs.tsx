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
import SearchResultsDisplay from "./searchResultsDisplay";

interface DialogProps {
  messages: IMessage[];
  onInfo: (info: string) => void;
}

const Dialogs: React.FC<DialogProps> = ({ messages, onInfo }) => {
  const { theme, mode } = useTheme();
  const isDark = mode === "dark";

  // Function to check if the tool message contains an error
  const isSearchError = (content: string): boolean => {
    return content?.startsWith("An error occurred");
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

                {m.content && m.content.trim() !== "" && (
                  <>
                    {/* Handle tool role messages differently */}
                    {m.role === "tool" ? (
                      <SearchResultsDisplay
                        content={m.content}
                        theme={theme}
                        isDark={isDark}
                        isSearchError={isSearchError}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[gfm as any]}
                        rehypePlugins={[raw as any]}
                        components={{
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(
                              className || "",
                            );
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
                  </>
                )}
              </div>
            </div>

            {/* Buttons at the bottom of the bubble */}
            {m.role !== "tool" && m.content && m.content.trim() !== "" && (
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
