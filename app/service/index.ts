import { IAnalytics } from "../account/analytics";
import { IAnswer, IPayload } from "../utils/chatUtils";
import { IModelList } from "../utils/listModels";
import { IUser } from "../utils/userUtils";
const URL: string = process.env.FULL_URL || "";

export const createConversation = async (title: string, defaultModel: IModelList): Promise<Response | null> => {
  return await fetch(`${URL}/api/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title : title,
        defaultModel: defaultModel,
      }),
    }).catch((err) => {
    throw new Error(err);
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

export const getSingleConversations = async (conversationID: string) => {
  return await fetch(`${URL}/api/get-single-conversation/${conversationID}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).catch((err) => {
  throw new Error(err);
});
};

export const updateTitleConversation = async (conversationID: string | undefined, newTitle: string) => {
  if (!conversationID) return; 
  return await fetch(`${URL}/api/update-title-conversation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id : conversationID,
      newTitle: newTitle,
    }),
  }).catch((err) => {
  throw new Error(err);
});
};

export const summaryConversation = async (userInput: string, model: IModelList) => {
  const titleToSummarize = "Summarize this text in 6 words : " + userInput;

    return await fetch(`${URL}/api/generate-title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleToSummarize: titleToSummarize,
        model: model,
      }),
    }).catch((err) => {
    throw new Error(err);
  });
}

// message services that send the message to /api/message API
export const storeMessage = async (payload: IPayload | null): Promise<Response | null> => {
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

export const getConversationHistory = async (conversationID: string): Promise<Response | null> => {
  return await fetch(`${URL}/api/get-history/${conversationID}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).catch((err) => {
  throw new Error(err);
});
};

export const getUserWithEmail = async (user: IUser): Promise<Response | null> => {
  return await fetch(`${URL}/api/authuser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
};

export const getEmail = async (): Promise<Response | null> => {
  return await fetch(`${URL}/api/get-email`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
}

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

export const getUserSettings = async (): Promise<Response | null> => {
  return await fetch(`${URL}/api/get-user-settings`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
};

export const updateUserSettings = async (newTheme: string | null, newModel: IModelList | null): Promise<Response | null> => {
  return await fetch(`${URL}/api/update-user-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newTheme: newTheme, newModel: newModel }),
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPassword),
  });
};

export const addUserAnalytics = async (analytics: IAnswer): Promise<Response | null> => {
  return await fetch(`${URL}/api/user-analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analytics),
  });
};

export const getUserAnalytics = async (): Promise<IAnalytics[]> => {
  const response = await fetch(`${URL}/api/get-user-analytics`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) return [];
  return response.json() as Promise<IAnalytics[]>;
};