import { Dispatch, SetStateAction } from "react";

type SetMessagesType = Dispatch<SetStateAction<IMessage[]>>;

type role = "user" | "assistant" | "system";

export interface IMessage {
    role: role,
    model?:string,
    prompt: string,
}

export interface IPayload {
    model: string,
    address: string,
    prompt: IMessage[],
    isStream:boolean
}

export interface IAnswer {
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    done_reason?: string,
    context?: number[]
}
// {"model":"tinyllama","created_at":"2025-10-16T17:56:49.249317848Z","response":"","done":true,"done_reason":"stop","context":[529,29989]

export interface IModelList {
  model_name: string;
  address: string;
}

export const handleStreamResponse = async (response : Response|null, setMessages: SetMessagesType) => {
    const decoder = new TextDecoder();

    switch (response?.body) {
        default: {
        const reader = response?.body.getReader();
        // Stream processing
        while (true) {
            if (!reader) { return }
            const { value, done } = await reader.read();
            if (done) break;
            // Decode the streamed chunks here
            const chunk : string = decoder.decode(value);
            const json : IAnswer = JSON.parse(chunk);
            const decodedMessage : string = json.response

            // Put it in the messages list
            setMessages((prev:any) => {
            const lastMessage = prev.at(-1);
            
            // If the last message is from assistant, append to it
            if (lastMessage?.role === "assistant") {
                const updatedMessage: IMessage = {
                ...lastMessage,
                prompt: lastMessage.prompt + decodedMessage,
                };
                return [...prev.slice(0, -1), updatedMessage];
            } 
            // Otherwise, create a new assistant message
            else {
                const newMessage: IMessage = {
                role: "assistant",
                model: "tinyllama",
                prompt: decodedMessage,
                };
                return [...prev, newMessage];
            }
            });
        }
        }
        case null: {
            break;
        }
    }
}