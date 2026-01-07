import { IMessage, IPayload } from '../utils/chatUtils';
import { IUser } from '../utils/userUtils';
const URL: string = process.env.FULL_URL || '';

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

// conversation services that creates the conversation to /api/conversation API
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

export const getUser = async (user: IUser):Promise<Response | null> => {
  return await fetch(
    `${URL}/api/authuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    }
  );
}

// user services that send the message to /api/message API
export const createUser = async (user : IUser):Promise<Error | null> => {
  const response = await fetch(
    "/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    }
  );

  if (!response.ok) {
    // Handle error
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create user');
  }

  // get info of new user
  const newUser: IUser = await response.json();

  // directly login and redirect to empty conversation
  //loginUser(newUser);

  return null;
}