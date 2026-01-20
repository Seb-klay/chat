"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../components/textInput/chatInput";
import { IMessage, IPayload } from "../../utils/chatUtils";
import { getConversationHistory } from "../../service/index";
import { IModelList } from "../../utils/listModels";
import { useParams } from "next/navigation";
import { MODELS } from "../../utils/listModels";
import Dialog from "../../components/dialogs/dialogs";
import DialogsSkeleton from "../../components/dialogs/dialogsSkeleton";
import { sendChatMessage } from "@/app/service/aiService";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [isChatbotWriting, setisChatbotWriting] = useState(false);

  useEffect(() => {
    const container = scrollRef.current?.parentElement;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 100;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId) return;
    loadConversationHistory(conversationId);
  }, [conversationId]);

  const loadConversationHistory = async (id: string) => {
    setLoadingConversation(true);
    const loadHistory = await getConversationHistory(id);
    if (!loadHistory?.ok) {
      throw new Error(
        "The conversation could not load. Refresh the page or create a new conversation."
      );
    }
    const history = await loadHistory.json();

    var messageHistory: IMessage[] = [];
    for (let chat of history) {
      const newMessage: IMessage = {
        role: chat.rolesender,
        model: chat.model,
        prompt: chat.textmessage,
      };
      messageHistory.push(newMessage);
    }
    setMessages(messageHistory);
    setLoadingConversation(false);

    // if first message send message manually to function
    if (messageHistory.length === 1) {
      console.log("--------------------------");
      console.log(messageHistory[0]);
      const modelId = messageHistory[0].model.id;
      const model = MODELS[modelId];
      await sendMessage(messageHistory[0].prompt, model);
    }
  };

  const handleAbort = () => {
    //setLoading(false);
    //setIsSending(false);
  };

  const sendMessage = async (userInput: string, selectedModel: IModelList) => {
    const messageText = userInput;
    const messageFromUser: IMessage = {
      role: "user",
      model: selectedModel,
      prompt: messageText,
    };
    const assistantPlaceholder: IMessage = {
      role: "assistant", // This ensures it uses the "Bot" styling/side
      model: selectedModel,
      prompt: "",
    };
    // store USER message in history
    setMessages((prev) => [...prev, messageFromUser, assistantPlaceholder]);

    try {
      // create payload
      var payloadFromUser: IPayload = {
        messages: messages,
        isStream: true,
        conversationID: conversationId,
      };
      setisChatbotWriting(true);

      const response = await sendChatMessage(payloadFromUser, {
        onData: (chunk: string) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const updated = { ...last, prompt: last.prompt + chunk };
            return [...prev.slice(0, -1), updated];
          });
        },

        // Handle errors (e.g., show a toast notification)
        onError: (err) => {
          console.error("Stream failed:", err);
        },

        // Finalize the message (e.g., replace temp ID with DB ID)
        onCompleted: () => {
          setisChatbotWriting(false);
        },
      });
    } catch (err) {
      setisChatbotWriting(false);
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] px-2">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 bg-transparent rounded-lg w-full md:w-1/2 mx-auto">
          {loadingConversation ? (
            <>
              <DialogsSkeleton />
            </>
          ) : (
            <>
              <Dialog messages={messages} />
              {isChatbotWriting && (
                <div className="flex space-x-2">
                  <div className="dot text-gray-100 w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="dot text-gray-100 w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="dot text-gray-100 w-2 h-2 rounded-full animate-bounce"></div>
                </div>
              )}
            </>
          )}

          {/* Anchor */}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full md:w-1/2 mx-auto bg-slate-950 sticky bottom-0">
        <div className="bg-transparent rounded-lg">
          <ChatInput
            isChatbotWriting={isChatbotWriting}
            onAbort={handleAbort}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
