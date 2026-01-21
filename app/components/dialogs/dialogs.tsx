import { IMessage } from "@/app/utils/chatUtils";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import { CodeBlock } from "./codeBlock";

interface DialogProps {
  messages: IMessage[];
}

const Dialogs: React.FC<DialogProps> = ({ messages }) => {
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
              className={`max-w-xs md:max-w-xl px-4 py-2 rounded-lg mt-3 md:mt-6 mb-3 md:mb-6 ${
                m.role === "user"
                  ? "bg-gray-900 text-gray-100"
                  : "bg-transparent text-gray-100"
              }`}
            >
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
                    <li className="whitespace-normal break-words" {...props} />
                  ),
                }}
              >
                {m.prompt}
              </ReactMarkdown>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Dialogs;
