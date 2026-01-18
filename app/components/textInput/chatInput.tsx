import { useEffect, useRef, useState } from "react";
import { IModelList } from "../../utils/listModels";
import ChooseAiModel from "../buttons/buttonAiModel";
import { LoadingButton } from "../buttons/loadingButton";
import { SendButton } from "../buttons/sendButton";
import { AbortButton } from "../buttons/abortButton";

type ChatInputProps = {
  isChatbotWriting?: boolean;
  isSending?: boolean;
  onAbort?: () => void;
  onSend: (message: string, model: IModelList) => void;
};

export default function ChatInput({ isChatbotWriting, onAbort, onSend }: ChatInputProps) {
  const [input, setInput] = useState("");
  //const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [model, setModel] = useState<IModelList>({
    id: 1,
    model_name: "llama3.2:3b",
    address: "",
  });

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
    //setLoading(false);
    //setIsSending(false);
    onSend(input, model);
    setInput("");
  };

  return (
    <div className="w-full mx-auto bg-slate-950 bottom-0">
      {/* Main Input Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="w-full p-4 pr-36 bg-gray-900 text-gray-100 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden overflow-y-scroll resize-none min-h-[30px] md:min-h-[60px]"
          rows={1}
          disabled={isSending}
          style={{ height: "auto" }}
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
            {isChatbotWriting ? (
              onAbort ? (
                <AbortButton onClick={onAbort} />
              ) : (
                <LoadingButton />
              )
            ) : isSending ? (
              <LoadingButton />
            ) : (
              <SendButton onClick={handleSend} disabled={!input.trim()} />
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
