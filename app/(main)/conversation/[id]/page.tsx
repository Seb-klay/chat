"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../../components/textInput/chatInput";
import {
  IMessage,
  IPayload,
  summaryConversationAndUpdate,
  prepareFilesForServer
} from "../../../utils/chatUtils";
import {
  getConversationHistory,
  getSingleConversations,
} from "../../../service/index";
import { IModelList } from "../../../utils/listModels";
import { useParams } from "next/navigation";
import Dialog from "../../../components/dialogs/dialogs";
import DialogsSkeleton from "../../../components/dialogs/dialogsSkeleton";
import { sendChatMessage } from "@/app/service/aiService";
import { useTheme } from "@/app/components/contexts/theme-provider";
import { Toaster, toast } from "sonner";
import { get, del } from "idb-keyval";

export interface IConversation {
  convid: string;
  title: string;
  userid: string;
  createdat: string;
  updatedat: string;
  defaultmodel: IModelList;
}

export type preparedFiles = {
  name: string;
  type: string;
  size: number;
  data: string;
};

export default function ConversationPage() {
  const params = useParams();
  const { theme } = useTheme();
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
      const loadHistory = await getConversationHistory(id);
      if (!loadHistory.ok)
        toast.warning(
          `Response ${loadHistory.status} occurred while loading conversation history. `,
        );
      const history: IMessage[] = await loadHistory?.json();

      // in case of a new conversation
      if (history.length === 0) {
        const response = await getSingleConversations(id);
        if (!loadHistory?.ok)
          toast.warning(
            `Response ${response?.status} occurred while loading conversation. `,
          );

        // checks if there are files in IndexedDB
        const files: File[] | undefined = await get("local_files");
        const newConversation: IConversation[] = await response?.json();
        // show conversation to user
        setLoadingConversation(false);
        
        await sendMessage(
          newConversation[0].title,
          newConversation[0].defaultmodel,
          files ?? [],
        );
        // clean up storage after use
        await del("local_files");

        // rename conversation
        await summaryConversationAndUpdate(newConversation[0], {
          onError: (err) => {
            toast.warning(`Bad response while summarizing title : ` + err);
          },
        });

        // otherwise just load the history
      } else {
        var messageHistory: IMessage[] = [];
        for (let chat of history) {
          const newMessage: IMessage = {
            role: chat.role,
            model: chat.model,
            content: chat.content,
            files: undefined,
            images: null
          };
          messageHistory.push(newMessage);
        }
        setMessages(messageHistory);
        setLoadingConversation(false); // once conversation is loaded, display it
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setOnAiWriting(false);
    }
  };

  const sendMessage = async (
    userInput: string,
    selectedModel: IModelList,
    files?: File[],
  ) => {
    const messageText = userInput;
    // TODO: handle images in files
    let filesImages: string[] | null = null;
   try {
      let preparedFiles: preparedFiles[] = [{
        name: "",
        type: "",
        size: 0,
        data: "",
      }] ;
      if (files && files?.length > 0)
        preparedFiles = await prepareFilesForServer(files);
      const messageFromUser: IMessage = {
        role: "user",
        model: selectedModel,
        content: messageText,
        files: preparedFiles,
        images: filesImages
      };
      const assistantPlaceholder: IMessage = {
        role: "assistant", // This ensures it uses the "Bot" styling/side
        model: selectedModel,
        content: "",
        files: undefined,
        images: null
      };
      // store USER message in history
      setMessages((prev) => [...prev, messageFromUser, assistantPlaceholder]);

      // create the controller when the user wants to abort the message generation
      const controller = new AbortController();
      abortControllerRef.current = controller;

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
              const updated = { ...last, content: last.content + chunk };
              return [...prev.slice(0, -1), updated];
            });
          },

          // Handle errors
          onError: (err) => {
            setOnAiThought(false);
            setOnAiWriting(false);
            toast.warning(String(err));
          },

          onWrite: () => {
            setOnAiThought(false);
            setOnAiWriting(true);
          },

          // Finalize the message
          onCompleted: () => {
            setOnAiWriting(false);
          },
        },
      );
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.primary,
      }}
      className="flex flex-col h-dvh px-2"
    >
      {/* Notifications */}
      <Toaster richColors position="top-center" />
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
              <div
                style={{ backgroundColor: theme.colors.primary }}
                className="dot w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"
              ></div>
              <div
                style={{ backgroundColor: theme.colors.primary }}
                className="dot w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"
              ></div>
              <div
                style={{ backgroundColor: theme.colors.primary }}
                className="dot w-2 h-2 rounded-full animate-bounce"
              ></div>
            </div>
          )}

          {/* Anchor */}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full md:w-1/2 mx-auto sticky bottom-0">
        <div className="rounded-lg">
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
