import { NextResponse } from 'next/server';
import { IAnswer, IMessage, IPayload } from '../utils/chatUtils';

// message services that send the message to /api/chat API
export const postMessage = async (payload: IPayload) => {
  // store user message before sending prompt to AI
  await storeMessage(payload.prompt.at(-1))

  // send prompt to AI assistant
  return await fetch(
      "/api/chat-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    )
}

// TODO create abort message

// message services that send the message to /api/conversation API
const createConversation = async (userId: number):Promise<Response | null> => {
  return await fetch(
      "/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userId)
      }
    );
}

// message services that send the message to /api/message API
export const storeMessage = async (message: IMessage | undefined):Promise<Response | null> => {
  // TODO before chating, make sure that a conversation is created !
  //const convId = await createConversation(1)

  return await fetch(
      "/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      }
    );
}