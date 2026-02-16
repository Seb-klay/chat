"use client";

import { useRouter } from "next/navigation";
import ChatInput from "../../components/textInput/chatInput";
import { createConversation } from "../../service";
import { IModelList } from "../../utils/listModels";
import { useState } from "react";
import { useTheme } from "../../components/contexts/theme-provider";
import { Toaster, toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [onAiThought, setOnAiThought] = useState(false);
  const { theme } = useTheme();

  const createAndRedirect = async (
    userInput: string,
    selectedModel: IModelList,
  ) => {
    if (!userInput.trim()) return;
    setOnAiThought(true);
    try {
      // Create new conversation with input as title and default model
      const response = await createConversation(userInput, selectedModel);
      if (!response?.ok)
        toast.warning(
          `Response ${response?.status} occurred while creating new conversation. `,
      );

      const data = await response?.json();
      const conversationId = data[0].convid;

      // Redirect to the new conversation
      router.push(`/conversation/${conversationId}`);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setOnAiThought(false);
    }
  };

  return (
    <div
      style={{ color: theme.colors.primary }}
      className="min-h-dvh flex flex-col items-center justify-center p-4 w-full md:w-1/2 lg:w-1/2 mr-auto ml-auto"
    >
      {/* Notifications */}
      <Toaster richColors position="top-center" />
      {/* Header with icon and text */}
      <div className="mb-12 text-center">
        {/* Icon */}
        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
        <p style={{ color: theme.colors.secondary }} className="text-gray-400">
          Start a conversation with our AI assistant
        </p>
      </div>

      <ChatInput
        onThought={onAiThought}
        onChatbotWriting={false}
        onSend={createAndRedirect}
      />
    </div>
  );
}
