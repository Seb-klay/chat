"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../../components/textInput/chatInput";
import {
  IMessage,
  IPayload,
  summaryConversationAndUpdate,
  prepareFilesForServer,
  tool,
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
import { useModel } from "@/app/components/contexts/model-provider";

export interface IConversation {
  convid: string;
  title: string;
  userid: string;
  createdat: string;
  updatedat: string;
  defaultmodel: IModelList;
}

export type preparedFiles = {
  id?: string;
  messid?: string;
  name: string;
  type: string | null;
  size: number;
  path?: string;
  isdirectory?: boolean;
  createdat?: string;
  updatedat?: string;
  isdeleted?: boolean;
  data?: string;
};

export default function ConversationPage() {
  const params = useParams();
  const { theme } = useTheme();
  const { allModels } = useModel();
  const conversationId = params.id as string; // used to get the id in the URL
  const [messages, setMessages] = useState<IMessage[]>([]); // list of messages history
  const scrollRef = useRef<HTMLDivElement>(null); // used to go at the bottom of the page
  const [loadingConversation, setLoadingConversation] = useState(false); // when conv is loading, activate skeleton page
  const [onAiState, setOnAiState] = useState({ id: 0, aiState: "" }); // when AI is writing, thinking, reasoning or using tools, update the UI
  const abortControllerRef = useRef<AbortController | null>(null);
  const onAiErrorRef = useRef<boolean>(false);
  const rollbackRef = useRef<{
    userInput: string;
    files?: File[];
  }>({
    userInput: "",
    files: [],
  });

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
        if (!response?.ok || !response)
          toast.warning(
            `Response ${response?.status} occurred while loading conversation. `,
          );

        // checks if there are files in IndexedDB
        const files: File[] | undefined = await get("local_files");
        const newConversation: IConversation[] = await response?.json();
        // show conversation to user
        setLoadingConversation(false);

        if (
          newConversation[0].defaultmodel == null ||
          newConversation[0].defaultmodel === undefined
        ) {
          newConversation[0].defaultmodel = allModels[0];
        }

        await sendMessage(
          newConversation[0].title,
          newConversation[0].defaultmodel,
          files ?? [],
        );
        // clean up storage after use
        await del("local_files");

        // rename conversation once ai stops writing
        if (onAiState.id !== 0)
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
            files: chat.files,
            //images: undefined,
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
      setOnAiState({ id: 0, aiState: "" });
    }
  };

  const handleError = (error: string) => {
    // remove indicators
    setOnAiState({ id: 0, aiState: "" });
    // add error for chat input to rollback
    onAiErrorRef.current = true;
    // remove previous 2 messages (user and assistant);
    setMessages((prev) => prev.slice(0, -2));
    // show error
    toast.error(`${error}`);
  };

  const handleInfo = (info: string) => {
    toast.info(info);
  };

  const sendMessage = async (
    userInput: string,
    selectedModel: IModelList,
    files?: File[],
    folderName?: string,
  ) => {
    // start by making sure error is false
    onAiErrorRef.current = false;
        // save current state
    rollbackRef.current = {
      userInput,
      files,
    };

    const messageText = userInput;
    // TODO: handle images in files
    let filesImages: string[] | undefined = undefined;
    try {
      setOnAiState({ id: 5, aiState: "Reading files" });

      let preparedFiles: preparedFiles[] = [];
      if (files) {
        preparedFiles.push({
          name: "",
          type: "",
          size: 0,
          path: "/",
          data: "",
          isdirectory: false,
        });
        const serverFiles = await prepareFilesForServer(files!);

        // add path to each file
        preparedFiles = serverFiles.map((file) => ({
          ...file,
          path: folderName ? `/${folderName}/${file.name}` : `/${file.name}`,
        }));
      }

      const messageFromUser: IMessage = {
        role: "user",
        model: selectedModel ?? allModels[0],
        content: messageText,
        files: preparedFiles,
        //images: filesImages,
      };
      const assistantPlaceholder: IMessage = {
        role: "assistant",
        model: selectedModel ?? allModels[0],
        content: "",
        tool_calls: [],
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

      setOnAiState({ id: 1, aiState: "Thinking" }); // ai is thinking (triggers 3 dots)

      await sendChatMessage(
        payloadFromUser,
        // pass the controller when message is aborting
        controller,
        {
          // when receiving data from the stream, update the message in real time
          onData: (chunk: string, toolcalls?: tool[]) => {
            if (chunk && chunk.length > 0) {
              setOnAiState((prev) => {
                if (prev.id === 2 || prev.id === 4) return prev;
                // Switch from thinking (id: 1) to writing (id: 3)
                if (prev.id === 1) return { id: 3, aiState: "Writing" };
                return prev;
              });
            }

            setMessages((prev) => {
              if (prev.length === 0) return prev;

              const last = prev[prev.length - 1];

              // if the last message is a tool, create a new assistant message.
              if (last.role === "tool") {
                return [
                  ...prev,
                  {
                    role: "assistant",
                    content: chunk,
                    tool_calls: toolcalls,
                  },
                ];
              }

              // Otherwise, append normally to the existing assistant message
              const updated = {
                ...last,
                content: (last.content || "") + chunk,
                tool_calls: toolcalls || last.tool_calls,
              };
              return [...prev.slice(0, -1), updated];
            });
          },

          onNewMessage: (newMessage: IMessage) => {
            setMessages((prev) => [...prev, newMessage]);
          },

          onToolCalls: (isCalling: boolean, toolName?: string) => {
            if (isCalling) {
              setOnAiState({ id: 4, aiState: toolName || "Searching" });
            } else {
              // Keep showing thinking state while processing tool results
              setOnAiState({ id: 1, aiState: "Thinking" });
            }
          },

          onReasoning: (isReasoning: boolean) => {
            if (isReasoning) {
              setOnAiState({ id: 2, aiState: "Reasoning" });
            } else {
              // Switch back to thinking, not clearing completely
              setOnAiState({ id: 1, aiState: "Thinking" });
            }
          },
          onAiWriting: () => {
            setOnAiState((prev) => {
              // Only switch if we're in thinking state
              if (prev.id === 1) {
                return { id: 3, aiState: "Writing" };
              }
              return prev;
            });
          },

          // Finalize the message
          onCompleted: () => {
            setOnAiState({ id: 0, aiState: "" });
          },

          // Handle errors
          onError: (err) => {
            handleError(String(err));
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
        <div className="space-y-2 bg-transparent rounded-lg w-full max-w-3xl mx-auto">
          {loadingConversation ? (
            <>
              <DialogsSkeleton />
            </>
          ) : (
            <>
              <Dialog messages={messages} onInfo={handleInfo} />
            </>
          )}

          {/* 0=none, 1=thinking, 2=reasoning, 3=writing, 4=tool, 5=files (parsing) */}
          {onAiState.id !== 0 && (
            <div className="my-8 md:my-12">
              {/* Thinking State (id: 1) */}
              {onAiState.id === 1 && (
                <div className="flex space-x-2 transition-all duration-300 ease-in-out animate-fadeIn">
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

              {/* Reasoning State (id: 2) or file reading (id:5) */}
              {(onAiState.id === 2 || onAiState.id === 5) && (
                <div className="flex items-center gap-2 transition-all duration-300 ease-in-out animate-fadeIn">
                  <span className="text-lg animate-pulse text-gray-500 dark:text-gray-400">
                    { onAiState.aiState }
                  </span>
                </div>
              )}

              {/* Tool Use State (id: 4) */}
              {onAiState.id === 4 && (
                <div className="flex items-center gap-2 transition-all duration-300 ease-in-out animate-fadeIn">
                  <span className="text-lg animate-pulse text-gray-500 dark:text-gray-400">
                    {onAiState.aiState === "search"
                      ? "Searching the internet..."
                      : `Using ${onAiState.aiState || "tool"}...`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Anchor */}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto sticky bottom-0">
        <div className="rounded-lg">
          <ChatInput
            onThought={onAiState.id === 1}
            onChatbotWriting={onAiState.id !== 0}
            onAbort={handleAbort}
            onSend={sendMessage}
            onError={handleError}
            aiError={onAiErrorRef.current}
            rollbackInput={onAiErrorRef.current ? rollbackRef.current.userInput : ""}
            rollbackFiles={onAiErrorRef.current ? rollbackRef.current.files : []}
          />
        </div>
      </div>
    </div>
  );
}
