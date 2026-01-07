import { NextResponse } from 'next/server';
import { IAnswer, IMessage, IPayload } from '../utils/chatUtils';

// check this blog for connection pool and a few tips : 
// https://medium.com/@artemkhrenov/connection-pooling-patterns-optimizing-database-connections-for-scalable-applications-159e78281389
// and for sessions
// https://medium.com/@levi_stringer/building-stateful-conversations-with-postgres-and-llms-e6bb2a5ff73e

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