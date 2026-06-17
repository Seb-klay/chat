import { useEffect, useRef, useState } from "react";
import { IModelList } from "../../utils/listModels";
import ChooseAiModel from "../buttons/buttonAiModel";
import { SendButton } from "../buttons/sendButton";
import { AbortButton } from "../buttons/abortButton";
import { useTheme } from "../contexts/theme-provider";
import { useModel } from "../contexts/model-provider";
import AiTools from "../dropdowns/aiTools";
import { formatFileSize, FileIcon } from "@/app/utils/fileUtils";

type ChatInputProps = {
  onThought: boolean;
  onChatbotWriting: boolean;
  onAbort?: () => void;
  onSend: (
    message: string,
    model: IModelList,
    files: File[],
    folderName?: string,
  ) => void;
  onError: (error: string) => void;
  aiError?: boolean;
  rollbackInput?: string,
  rollbackFiles?: File[],
};

export default function ChatInput({
  onThought,
  onChatbotWriting,
  onAbort,
  onSend,
  onError,
  aiError,
  rollbackInput,
  rollbackFiles,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [nameFolder, setNameFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { defaultModel } = useModel();
  const [model, setModel] = useState<IModelList>(defaultModel);
  const { theme } = useTheme();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height first (required for shrink on mobile)
    textarea.style.height = "auto";

    // Choose max height based on screen size
    const isMobile = window.innerWidth < 768;
    const maxHeight = isMobile ? 150 : 300;

    // Force layout read AFTER reset
    const scrollHeight = textarea.scrollHeight;

    // Apply bounded height
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Toggle scrolling
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    if (!aiError) return;

    setInput(rollbackInput || "");
    setSelectedFiles(rollbackFiles ?? []);
  }, [aiError]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    // send message
    onSend(input, model, selectedFiles, nameFolder);
    // remove text for ui
    setSelectedFiles([]);
    setInput("");
  };

  const handleFileSelect = (files: File[], folderName?: string) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    if (folderName) setNameFolder(folderName);
  };

  const handleError = (error: string) => {
    onError(error);
  };

  return (
    <div className="w-full mx-auto bottom-0">
      {/* Files container */}
      <div className="relative">
        <div
          className={`
          rounded-t-xl 
          transition-all duration-300 ease-in-out
          overflow-x-auto overflow-y-hidden
          ${selectedFiles.length > 0 ? "h-16 opacity-100" : "h-0 opacity-0"}
        `}
          style={{
            backgroundColor: theme.colors.background_second,
          }}
        >
          {/* Files list */}
          <div className="flex items-center gap-2 px-2 py-2">
            {selectedFiles.map((file, index) => {
              const isUnsupported =
                file.type?.startsWith("video/") ||
                file.type?.startsWith("audio/");

              return (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    backgroundColor: theme.colors.tertiary_background,
                    color: theme.colors.secondary,
                  }}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-sm whitespace-nowrap"
                >
                  {/* File icon/logo */}
                  <div className="text-2xl mb-1">
                    <FileIcon fileType={file.type} />
                  </div>

                  {/* File name */}
                  <div className="flex flex-col">
                    <span className="truncate max-w-24 font-medium">
                      {file.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {isUnsupported && (
                    <span className="text-[10px] font-bold mt-0.5 text-red-600">
                      NOT SUPPORTED
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => {
                      const newFiles = selectedFiles.filter(
                        (_, i) => i !== index,
                      );
                      setSelectedFiles(newFiles);
                    }}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Main Input Container */}
      <div className="relative">
        {/* Textarea - First row */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          style={{
            backgroundColor: theme.colors.background_second,
            color: theme.colors.primary,
            height: "auto",
          }}
          className={`
            w-full py-4 px-4 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden overflow-y-scroll resize-none min-h-10 md:min-h-12
            ${selectedFiles.length > 0 ? "rounded-b-xl" : "rounded-xl"}
          `}
          rows={2}
          disabled={onChatbotWriting}
        />

        {/* Buttons Container - Second row */}
        <div className="flex items-center justify-between mt-2">
          {/* Left side buttons */}
          <div className="flex items-center gap-2">
            <AiTools onFile={handleFileSelect} onError={handleError} />
            <ChooseAiModel
              onModelSelect={(model) => {
                setModel(model);
              }}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center">
            {/* Send/Abort Button */}
            {onChatbotWriting ? (
              <AbortButton onClick={onAbort || (() => {})} />
            ) : (
              <SendButton
                onClick={handleSend}
                disabled={!input.trim() || onThought}
              />
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex justify-center mb-2">
        <span className="text-xs flex items-center gap-1">
          <span>AI-generated content may be inaccurate</span>
        </span>
      </div>
    </div>
  );
}
