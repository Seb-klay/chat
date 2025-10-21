import { IPayload } from '../utils/chatUtils';

// message services that send the message to /api/chat API
export const postMessage = async (payload: IPayload):Promise<Response | null> => {
  return await fetch(
      "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
}