"use client";

import { useEffect, useState } from "react";
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

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationHistory(conversationId);
  }, [conversationId]);

  const loadConversationHistory = async (id: string) => {
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
    <div className="flex flex-col h-screen items-center w-full md:w-1/2 ml-auto mr-auto bg-transparent scroll-smooth">
      {/* Messages */}
      <Dialog messages={messages} />

      {/* Chat Input */}
      <div className="sticky bottom-0 w-full p-4">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
