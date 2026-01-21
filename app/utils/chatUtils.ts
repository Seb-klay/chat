import { Dispatch, SetStateAction } from "react";
import { IModelList } from "./listModels";

type SetMessagesType = Dispatch<SetStateAction<IMessage[]>>;

type role = "user" | "assistant" | "system";

export interface IMessage {
  role: role;
  model: {
    id: number;
  };
  prompt: string;
}

export interface IPayload {
  messages: IMessage[];
  isStream: boolean;
  conversationID: string | string[] | undefined;
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

// export const handleStreamResponse = async (
//   response: Response | null,
//   model: IModelList,
//   setMessages: SetMessagesType
// ) => {
//   let responseFromChatbot: IMessage = 
//     {
//       role: "assistant",
//       model: {
//         id: model.id
//       },
//       prompt: "",
//   };
//   setMessages(prev => [...prev, responseFromChatbot])
//   let answerMessage: string = "";

//   const decoder = new TextDecoder();

//   if (!response?.ok || response == null) {
//     throw new Error(`Upstream error: ${response?.statusText}`)
//   }

//   const reader = response.body?.getReader();
//   // Stream processing
//   while (true) {
//     if (!reader) {
//       break;
//     }
//     const { value, done } = await reader.read();
//     if (done) {
//       break
//     };
//     // Decode the streamed chunks here
//     const chunk: string = decoder.decode(value);
//     const json: IAnswer = JSON.parse(chunk);
//     const decodedMessage: string = json.response;
//     answerMessage += decodedMessage;

//     if (json.done) {
//       responseFromChatbot.prompt = answerMessage;
//       //setMessages(prev => [...prev, responseFromChatbot])
//       //return responseFromChatbot;
//       // Storing final message from chatbot
//       //await storeMessage(responseFromChatbot);
//       return responseFromChatbot;
//     }

//     //Put it in the messages list
    
//     setMessages((prev: any) => {
//       if (!prev.at(-1)) return
//       const lastMessage: IMessage = prev.at(-1);

//       //If the last message is from assistant, append to it
//       if (lastMessage?.role === "assistant") {
//         const updatedMessage: IMessage = {
//           ...lastMessage,
//           prompt: lastMessage.prompt + decodedMessage,
//         };
//         return [...prev.slice(0, -1), updatedMessage];
//       }
//       return prev;
//     });
//   }
// };

// simpler handleStream to test :
// const reader = res.body?.getReader();
// if (!reader) throw new Error("No reader available");

// let aiResponse = "";
// setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "" }]);

// while (true) {
//   const { done, value } = await reader.read();
//   if (done) break;

//   const chunk = new TextDecoder().decode(value);
//   const lines = chunk.split("\n\n");
//   for (const line of lines) {
//     if (line.startsWith("data: ")) {
//       const data = line.slice(6);
//       if (data === "[DONE]") {
//         setIsLoading(false);
//         break;
//       }
//       try {
//         const parsedData = JSON.parse(data);
//         if (typeof parsedData === "string") {
//           aiResponse += parsedData;
//           setMessages(prevMessages => {
//             const updatedMessages = [...prevMessages];
//             updatedMessages[updatedMessages.length - 1].content += parsedData;
//             return updatedMessages;
//           });
//         }
//       } catch (error) {
//         console.error("Error parsing data:", error);
//       }
//     }
//   }
// }