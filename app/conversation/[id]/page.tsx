"use client";

import { useEffect, useState } from "react";
import {
  IMessage,
  IPayload,
  handleStreamResponse,
  IModelList,
} from "../../utils/chatUtils";
import {
  sendMessageToAI,
  storeMessage,
  getConversationHistory,
} from "../../service/index";
import ChooseAiModel from "../../components/buttons/buttonAiModel";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<IModelList>({
    model_name: "llama3.2:3b",
    address: "http://localhost:11435",
  });

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

    if (messageHistory.length === 1) {
      await sendMessage(messageHistory[0].prompt);
    }
  };

  const postMessageToDB = async (payload: IPayload) => {
    const response = await storeMessage(payload);

    if (!response?.ok) {
      throw new Error("Could not save the message. Try again please.");
    }
    return response;
  };

  const sendMessage = async (userInput?: string) => {
    const messageText = userInput || input;
    const messageFromUser: IMessage = {
      role: "user",
      model: selectedModel.model_name,
      prompt: messageText,
    };

    setInput("");

    try {
      // store USER message in history
      const newMessages: IMessage[] = [...messages, messageFromUser];
      setMessages(newMessages);
      // create payload
      var payloadFromUser: IPayload = {
        model: selectedModel.model_name,
        address: selectedModel.address,
        prompt: newMessages,
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
      const aiResponse = await handleStreamResponse(streaming, setMessages);

      if (!aiResponse) {
        throw new Error(
          "The AI message could not be generated. Try again please."
        );
      }
      // Store response from AI
      const messageFromAI: IMessage = aiResponse;

      // create payload
      var payloadFromAI: IPayload = {
        model: selectedModel.model_name,
        address: selectedModel.address,
        prompt: [...messages, messageFromAI],
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full h-full min-h-1/2 space-y-4">
        <div className="border rounded-lg p-4 overflow-y-auto bg-black">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div key={i} className="mb-2">
                <b>{m.role === "user" ? "You" : "Assistant"}:</b> {m.prompt}
              </div>
            ))}
        </div>
        <div className="flex space-x-2">
          {/* input keyboard user */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg p-2"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          {/* send button */}
          <ChooseAiModel
            model={selectedModel}
            setModel={setSelectedModel}
          ></ChooseAiModel>
          <button
            onClick={() => sendMessage()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
