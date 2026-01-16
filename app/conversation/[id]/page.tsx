"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../components/textInput/chatInput";
import {
  IMessage,
  IPayload,
  handleStreamResponse,
} from "../../utils/chatUtils";
import {
  sendMessageToAI,
  storeMessage,
  getConversationHistory,
} from "../../service/index";
import { IModelList } from "../../utils/listModels";
import { useParams } from "next/navigation";
import { MODELS } from "../../utils/listModels";
import Dialog from "../../components/dialogs/dialogs";
import DialogsSkeleton from "../../components/dialogs/dialogsSkeleton";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const loadHistory = await getConversationHistory(id);
    if (!loadHistory.ok) {
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
    setLoading(false);

    // if first message send message manually to function
    if (messageHistory.length === 1) {
      const modelId = messageHistory[0].model.id;
      const model = MODELS[modelId];
      await sendMessage(messageHistory[0].prompt, model);
    }
  };

  const postMessageToDB = async (payload: IPayload) => {
    const response = await storeMessage(payload);

    if (!response?.ok) {
      throw new Error("Could not save the message. Try again please.");
    }
    return response;
  };

  const sendMessage = async (userInput: string, selectedModel: IModelList) => {
    const messageText = userInput;
    const messageFromUser: IMessage = {
      role: "user",
      model: selectedModel,
      prompt: messageText,
    };

    try {
      // store USER message in history
      const newMessages: IMessage[] = [...messages, messageFromUser];
      setMessages(newMessages);
      // create payload
      var payloadFromUser: IPayload = {
        messages: newMessages,
        isStream: true,
        conversationID: conversationId,
      };

      // Store message user in DB
      const userResponse = await postMessageToDB(payloadFromUser);

      if (!userResponse?.ok) {
        throw new Error("Your message could not be stored. Try again please.");
      }

      // then sendMessage to AI
      var streaming = await sendMessageToAI(payloadFromUser);

      if (!streaming.ok) {
        throw new Error(
          "The AI message could not be generated. Try again please."
        );
      }

      // handle incoming stream response
      const aiResponse = await handleStreamResponse(
        streaming,
        selectedModel,
        setMessages
      );

      if (!aiResponse) {
        throw new Error(
          "The AI message could not be generated. Try again please."
        );
      }
      // Store response from AI
      const messageFromAI: IMessage = aiResponse;

      // create payload
      var payloadFromAI: IPayload = {
        messages: [...messages, messageFromAI],
        isStream: true,
        conversationID: conversationId,
      };

      // Store AI message in DB
      const res = await postMessageToDB(payloadFromAI);
      if (!res.ok) {
        throw new Error(
          "The AI message could not be stored. Try again please."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] px-2">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 bg-transparent rounded-lg w-full md:w-1/2 mx-auto">
          {loading ? (
          // Render multiple skeletons while loading
          <>
            <DialogsSkeleton />
          </>
        ) : (
          <Dialog messages={messages} />
        )}

          {/* Anchor */}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full md:w-1/2 mx-auto bg-slate-950 sticky bottom-0">
        <div className="bg-transparent rounded-lg">
          <ChatInput onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}