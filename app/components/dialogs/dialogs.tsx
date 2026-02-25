import { IMessage } from "@/app/utils/chatUtils";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import { CodeBlock } from "./codeBlock";
import { useTheme } from "../contexts/theme-provider";
import { handleFileDownload, formatFileSize, FileIcon } from "@/app/utils/fileUtils";
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface DialogProps {
  messages: IMessage[];
}

const Dialogs: React.FC<DialogProps> = ({ messages }) => {
  const { theme } = useTheme();

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
                          onClick={() => handleFileDownload({fileName: file.name, fileId: file?.id})}
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
                    <ul className="-mt-1 list-disc space-y-2 pl-8" {...props} />
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
            </div>
          </div>
        ))}
    </div>
  );
};

export default Dialogs;
