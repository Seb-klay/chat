import { SetStateAction, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IModelList } from "../../utils/chatUtils";
import { IMessage, IPayload } from "@/app/utils/chatUtils";
import { createConversation, storeMessage } from "@/app/service";
import ChooseAiModel from "../buttons/buttonAiModel";

export default function ChatInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState<IModelList>({
    model_name: "llama3.2:3b",
    address: "http://localhost:11435",
  });

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      if (textarea.scrollHeight <= 200) {
        // Still within max height, auto-grow
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      } else {
        // Exceeded max height, enable scrolling
        textarea.style.height = "300px";
        textarea.style.overflowY = "auto";
      }
    }
  }, [input]);

  const handleAbort = () => {
    setLoading(false);
    setIsSending(false);
    console.log("Request aborted");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createAndRedirect();
    }
  };

  const createAndRedirect = async () => {
    if (!input.trim()) return;

    setIsSending(true);
    setLoading(true);

    // Set empty list of message
    const newMessages: IMessage[] = [
      { role: "user", model: selectedModel.model_name, prompt: input },
    ];

    try {
      // Create new conversation
      const response = await createConversation();

      if (!response?.ok) {
        throw new Error(
          `Error with status ${response?.status} while creating a conversation. Try again please.`
        );
      }

      const data = await response?.json();
      const conversationId = data.rows[0].convid;

      // create payload to send prompt to AI
      const payload: IPayload = {
        model: selectedModel.model_name,
        address: selectedModel.address,
        prompt: newMessages,
        isStream: true,
        conversationID: conversationId,
      };

      // Store message in new conversation
      storeMessage(payload);

      // Redirect to the new conversation
      router.push(`/conversation/${conversationId}`);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Input Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="w-full p-4 pr-36 bg-gray-900 text-white border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden resize-none min-h-[60px] max-h-[300px]"
          rows={1}
          disabled={isSending}
          style={{ height: "auto" }}
        />

        {/* Button Container */}
        <div className="absolute right-2 bottom-2 flex items-center gap-2 mb-2 mr-2">
          <ChooseAiModel
            model={selectedModel}
            setModel={setSelectedModel}
          ></ChooseAiModel>

          {/* Send/Abort Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={isSending ? handleAbort : createAndRedirect}
              disabled={!input.trim() && !isSending}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSending
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
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
