import { IPayload } from "../utils/chatUtils";
import { IUser } from "../utils/userUtils";
const URL: string = process.env.FULL_URL || "";

// message services that send the message to /api/chat API
export const sendMessageToAI = async (payload: IPayload | null) => {
  console.log(payload)
  // send prompt to AI assistant
  return await fetch(`${URL}/api/chat-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    throw new Error(err);
  });
};

// TODO create abort message function
export const abortMessage = async (): Promise<Response | null> => {
  return null;
};

// conversation services that creates the conversation to /api/conversation API
export const createConversation = async (): Promise<Response | null> => {
  return await fetch(`${URL}/api/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteConversation = async (conversationID: string) => {
  return await fetch(`${URL}/api/delete-conversation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id : conversationID,
      }),
    }).catch((err) => {
    throw new Error(err);
  });
};

export const getUserConversations = async () => {
  return await fetch(`${URL}/api/get-user-conversation`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).catch((err) => {
  throw new Error(err);
});
};

// message services that send the message to /api/message API
export const storeMessage = async (payload: IPayload | null) => {
  console.log(payload)
  return await fetch(`${URL}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: payload?.messages,
        conversationId: payload?.conversationID,
      }),
    }).catch((err) => {
    throw new Error(err);
  });
};

export const getConversationHistory = async (conversationId: string) => {
  return await fetch(`${URL}/api/get-history/${conversationId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).catch((err) => {
  throw new Error(err);
});
};

export const getUser = async (user: IUser): Promise<Response | null> => {
  return await fetch(`${URL}/api/authuser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
};

// user services that send the message to /api/message API
export const createUser = async (user: IUser): Promise<Response | null> => {
  return await fetch(`${URL}/api/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  }).catch((err) => {
    throw new Error(err);
  });
};

export const deleteUserAccount = async (): Promise<Response | null> => {
  return await fetch(`${URL}/api/delete-user`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  }).catch((err) => {
    throw new Error(err);
  });
};

export const getAccountDetails = async (): Promise<Response | null> => {
  return await fetch(`${URL}/api/account-details`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
};

export const validateUser = async (
  email: string,
  code: string,
  expiresAt: string
): Promise<Response | null> => {
  return await fetch(`${URL}/api/validate-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, code: code, expiresAt: expiresAt }),
  }).catch((err) => {
    throw new Error(err);
  });
};

export const verifySignupCode = async (
  email: string,
  code: string
): Promise<Response | null> => {
  return await fetch(`${URL}/api/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, code: code }),
  }).catch((err) => {
    throw new Error(err);
  });
};

export const updatePasswordUser = async (newPassword: string): Promise<Response | null> => {
  return await fetch(`${URL}/api/update-password`, {
    method: "UPDATE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPassword),
  });
};