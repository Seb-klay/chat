import { useEffect, useRef, useState } from "react";
import { IModelList } from "../../utils/listModels";
import ChooseAiModel from "../buttons/buttonAiModel";

type ChatInputProps = {
  onSend: (message: string, model: IModelList) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleAbort = () => {
    setLoading(false);
    setIsSending(false);
  };

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
            <button
              onClick={isSending ? handleAbort : handleSend}
              disabled={!input.trim() && !isSending}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSending
                  ? "bg-red-600 hover:bg-red-700 text-gray-100"
                  : "bg-blue-600 hover:bg-blue-700 text-gray-100"
              }`}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
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
