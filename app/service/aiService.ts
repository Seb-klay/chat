"use client";

import { addUserAnalytics, storeMessage } from ".";
import { IAnswer, IMessage, IPayload } from "../utils/chatUtils";

type StreamCallbacks = {
  onData: (content: string) => void;
  onWrite: () => void;
  onCompleted: () => void;
  onError: (error: any) => void;
};

export const sendChatMessage = async (
  payload: IPayload,
  abortController: AbortController,
  callbacks: StreamCallbacks
) => {
  try {
    // store user message
    const responseStore = await storeMessage(payload);
    if (!responseStore) throw new Error("Error while storing the message of the user. ");

    // send user input to AI model
    const responseChat = await fetch(`/api/chat-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
    if (!responseChat) throw new Error("Error while chatting with AI. ");
    // Pass the stream to the handler
    await handleStream(responseChat, payload, callbacks);
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted by user");
    } else {
      callbacks.onError(error);
    }
  }
};

const handleStream = async (
  response: Response,
  payload: IPayload,
  { onData, onWrite, onCompleted, onError }: StreamCallbacks
) => {
  // AI stops thinking and starts writing message
  onWrite();

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) throw new Error("No reader available");

  let buffer = "";
  let aiResponse = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    // Decode and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // Logic to handle Server-Sent Events
    const lines = buffer.split("\n");

    // Keep the last partial line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const data: IAnswer = JSON.parse(trimmed);

        if (data.response) {
          aiResponse += data.response;
          onData(data.response);
        }

        if (data.done) {
          const assistantPlaceholder: IMessage = {
            role: "assistant",
            model: payload.messages.at(-1)!.model,
            prompt: aiResponse,
          };
          // create payload
          var payloadFromAI: IPayload = {
            messages: [...payload.messages, assistantPlaceholder],
            isStream: true,
            conversationID: payload.conversationID,
          };
          // store AI message
          const storingResponse = await storeMessage(payloadFromAI);

          if (!storingResponse?.ok) throw new Error(`Response with status ${storingResponse?.status} while storing the message of the user.`);
          // store analytics detail
          const analytics: IAnswer = {
            model: data.model,
            created_at: data.created_at,
            total_duration: data.total_duration,
            load_duration: data.load_duration,
            prompt_eval_count: data.prompt_eval_count,
            prompt_eval_duration: data.prompt_eval_duration,
            eval_count: data.eval_count,
            eval_duration: data.eval_duration,
          };

          const analyticsResponse = await addUserAnalytics(analytics);

          if (!analyticsResponse?.ok) throw new Error(`Response with status ${analyticsResponse?.status} while storing user's analytics.`);
          // stop loading icons
          onCompleted();
          return;
        }
      } catch (e) {
        onError("Error parsing stream chunk" + e);
      }
    }
  }
};
