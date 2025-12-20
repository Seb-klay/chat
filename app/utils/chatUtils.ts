import { NextResponse } from "next/server";
import { Dispatch, SetStateAction } from "react";
import { storeMessage } from '../service/index';

type SetMessagesType = Dispatch<SetStateAction<IMessage[]>>;

type role = "user" | "assistant" | "system";

export interface IMessage {
  role: role;
  model?: string;
  prompt: string;
}

export interface IPayload {
  model: string;
  address: string;
  prompt: IMessage[];
  isStream: boolean;
}

export interface IAnswer {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;
  context?: number[];
}
// {"model":"tinyllama","created_at":"2025-10-16T17:56:49.249317848Z","response":"","done":true,"done_reason":"stop","context":[529,29989]

export interface IModelList {
  model_name: string;
  address: string;
}

export const handleStreamResponse = async (
  response: Response | null,
  setMessages: SetMessagesType
) => {
  const responseFromChatbot: IMessage = 
    {
      role: "assistant",
      model: "tinyllama",
      prompt: "",
  };
  setMessages(prev => [...prev, responseFromChatbot])
  let answerMessage: string = "";

  const decoder = new TextDecoder();

  if (!response?.ok || response == null) {
    return NextResponse.json(
      { error: `Upstream error: ${response?.statusText}` },
      { status: response?.status }
    );
  }

  const reader = response.body?.getReader();
  // Stream processing
  while (true) {
    if (!reader) {
      break;
    }
    const { value, done } = await reader.read();
    if (done) {
      break
    };
    // Decode the streamed chunks here
    const chunk: string = decoder.decode(value);
    const json: IAnswer = JSON.parse(chunk);
    const decodedMessage: string = json.response;
    answerMessage += decodedMessage;

    if (json.done) {
      const responseFromChatbot: IMessage = 
      {
        role: "assistant",
        model: json.model,
        prompt: answerMessage,
      };
      // Storing final message from chatbot
      await storeMessage(responseFromChatbot);
    }

    //Put it in the messages list
    
    setMessages((prev: any) => {
      if (!prev.at(-1)) return
      const lastMessage: IMessage = prev.at(-1);

      //If the last message is from assistant, append to it
      if (lastMessage?.role === "assistant") {
        const updatedMessage: IMessage = {
          ...lastMessage,
          prompt: lastMessage.prompt + decodedMessage,
        };
        return [...prev.slice(0, -1), updatedMessage];
      }
      return prev;
      // Otherwise, create a new assistant message
      // else {
      //   const newMessage: IMessage = {
      //     role: "assistant",
      //     model: "tinyllama",
      //     prompt: decodedMessage,
      //   };
      //   return [...prev, newMessage];
      // }
    });
  }
};
