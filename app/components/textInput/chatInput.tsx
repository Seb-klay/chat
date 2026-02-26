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
  onSend: (message: string, model: IModelList, files: File[], folderName?: string) => void;
};

export default function ChatInput({
  onThought,
  onChatbotWriting,
  onAbort,
  onSend,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [nameFolder, setNameFolder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModel } = useModel();
  const [model, setModel] = useState<IModelList>(selectedModel);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input, model, selectedFiles, nameFolder);
      setSelectedFiles([]);
      setInput("");
    }
  };

  const handleSend = () => {
    onSend(input, model, selectedFiles, nameFolder);
    setSelectedFiles([]);
    setInput("");
  };

  const handleFileSelect = (files: File[], folderName?: string) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    if (folderName) setNameFolder(folderName);
  };

  return (
    <div className="w-full mx-auto bottom-0">
      {/* Files container */}
      <div className="relative">
        <div
          className={`
          absolute -bottom-2 left-0 right-0 
          rounded-t-xl 
          transition-all duration-300 ease-in-out
          overflow-x-auto overflow-y-hidden
          ${selectedFiles.length > 0 ? "h-16 opacity-100" : "h-0 opacity-0"}
        `}
          style={{
            transform:
              selectedFiles.length > 0 ? "translateY(0)" : "translateY(100%)",
            visibility: selectedFiles.length > 0 ? "visible" : "hidden",
            backgroundColor: theme.colors.background_second,
            paddingBottom: "1rem",
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
                    <FileIcon 
                      fileType={file.type} 
                    />
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
        <div className="absolute left-2 bottom-2.5 flex items-center gap-2 mb-2 ml-2">
          <AiTools onFile={handleFileSelect} />
        </div>

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
          className="w-full py-4 pr-36 pl-18 border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden overflow-y-scroll resize-none min-h-7.5 md:min-h-15"
          rows={1}
          disabled={onChatbotWriting}
        />

        {/* Button Container */}
        <div className="absolute right-2 bottom-2.5 flex items-center gap-2 mb-2 mr-2">
          <ChooseAiModel
            onModelSelect={(model) => {
              setModel(model);
            }}
          ></ChooseAiModel>

          {/* Send/Abort Button */}
          <div className="flex items-center gap-2">
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
      {/* Character Counter */}
      <span
        className={`text-xs px-2 ${
          input.length > 2000 ? "text-red-400" : "text-gray-500"
        }`}
      >
        {input.length}
      </span>
    </div>
  );
}
