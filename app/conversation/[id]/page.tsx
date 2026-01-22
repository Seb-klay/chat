"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../components/textInput/chatInput";
import { IMessage, IPayload, summaryConversationAndUpdate } from "../../utils/chatUtils";
import {
  getConversationHistory,
  getSingleConversations,
} from "../../service/index";
import { IModelList } from "../../utils/listModels";
import { useParams } from "next/navigation";
import Dialog from "../../components/dialogs/dialogs";
import DialogsSkeleton from "../../components/dialogs/dialogsSkeleton";
import { sendChatMessage } from "@/app/service/aiService";

  export type IConversation = {
    convid: string;
    title: string;
    userid: string;
    createdat: string;
    updatedat: string;
    defaultmodel: IModelList;
  };

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string; // used to get the id in the URL
  const [messages, setMessages] = useState<IMessage[]>([]); // list of messages history
  const scrollRef = useRef<HTMLDivElement>(null); // used to go at the bottom of the page
  const [loadingConversation, setLoadingConversation] = useState(false); // when conv is loading, activate skeleton page
  const [onAiWriting, setOnAiWriting] = useState(false); // when AI is writing
  const [onAiThought, setOnAiThought] = useState(false); // when AI "thinks" or waiting for the AI stream, it triggers the 3 waiting dots
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // load history function
  const loadConversationHistory = async (id: string) => {
    try {
      setLoadingConversation(true);
      const loadHistory = await getConversationHistory(id).catch((err) => {
        throw new Error("The user history could not load. " + err);
      });
      const history: IMessage[] = await loadHistory?.json();
      // in case of a new conversation
      if (history.length === 0) {
        const response = await getSingleConversations(id).catch((err) => {
          throw new Error(err);
        });
        const newConversation: IConversation[] = await response?.json();
        await sendMessage(newConversation[0].title, newConversation[0].defaultmodel);
        // rename conversation
        await summaryConversationAndUpdate(newConversation[0]);
      // otherwise just load the history
      } else {
        var messageHistory: IMessage[] = [];
        for (let chat of history) {
          const newMessage: IMessage = {
            role: chat.role,
            model: chat.model,
            prompt: chat.prompt,
          };
          messageHistory.push(newMessage);
        }
        setMessages(messageHistory);
      }
      setLoadingConversation(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setOnAiWriting(false);
    }
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

    // create the controller when the user wants to abort the message generation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // create payload
      var payloadFromUser: IPayload = {
        messages: [...messages, messageFromUser],
        isStream: true,
        conversationID: conversationId,
      };
      setOnAiThought(true);

      await sendChatMessage(
        payloadFromUser,
        // pass the controller when message is aborting
        controller,
        {
          onData: (chunk: string) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              const updated = { ...last, prompt: last.prompt + chunk };
              return [...prev.slice(0, -1), updated];
            });
          },

          // Handle errors
          onError: (err) => {
            setOnAiThought(false);
            setOnAiWriting(false);
            console.error("Stream failed:", err);
          },

          onWrite: () => {
            setOnAiThought(false);
            setOnAiWriting(true);
          },

          // Finalize the message
          onCompleted: () => {
            setOnAiWriting(false);
          },
        }
      );
    } catch (err) {
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
            </>
          )}

          {onAiThought && (
            <div className="flex space-x-2 mb-6">
              <div className="dot bg-gray-100 w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="dot bg-gray-100 w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="dot bg-gray-100 w-2 h-2 rounded-full animate-bounce"></div>
            </div>
          )}

          {/* Anchor */}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full md:w-1/2 mx-auto bg-slate-950 sticky bottom-0">
        <div className="bg-transparent rounded-lg">
          <ChatInput
            onThought={onAiThought}
            onChatbotWriting={onAiWriting}
            onAbort={handleAbort}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
