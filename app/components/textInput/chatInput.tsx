import { useEffect, useRef, useState } from "react";
import { IModelList } from "../../utils/listModels";
import ChooseAiModel from "../buttons/buttonAiModel";
import { SendButton } from "../buttons/sendButton";
import { AbortButton } from "../buttons/abortButton";
import { useTheme } from "../contexts/theme-provider";

type ChatInputProps = {
  onThought: boolean;
  onChatbotWriting: boolean;
  onAbort?: () => void;
  onSend: (message: string, model: IModelList) => void;
};

export default function ChatInput({
  onThought,
  onChatbotWriting,
  onAbort,
  onSend,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [model, setModel] = useState<IModelList>({
    id: 1,
    model_name: "llama3.2:3b",
  });
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
      onSend(input, model);
      setInput("");
    }
  };

  const handleSend = () => {
    onSend(input, model);
    setInput("");
  };

  return (
    <div className="w-full mx-auto bottom-0">
      {/* Main Input Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
           style={{backgroundColor: theme.colors.background_second, color: theme.colors.primary, height: "auto"}}
          className="w-full p-4 pr-36 border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden overflow-y-scroll resize-none min-h-[30px] md:min-h-[60px]"
          rows={1}
          disabled={onChatbotWriting}
        />

        {/* Button Container */}
        <div className="absolute right-2 bottom-2 flex items-center gap-2 mb-2 mr-2">
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
