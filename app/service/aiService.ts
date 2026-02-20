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
  callbacks: StreamCallbacks,
) => {
  try {
    // store user message
    const responseStore = await storeMessage(payload);
    if (!responseStore?.ok)
      throw new Error(
        `Response ${responseStore?.status} occurred while storing the message of the user. `,
      );

    // send user input to AI model
    const responseChat = await fetch(`/api/chat-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
    if (!responseChat.ok)
      throw new Error(
        `Response ${responseChat.status} occurred while chatting with AI. `,
      );
    // Pass the stream to the handler
    await handleStream(responseChat, payload, callbacks);
  } catch (error: any) {
    callbacks.onError(error);
  }
};

const handleStream = async (
  response: Response,
  payload: IPayload,
  { onData, onWrite, onCompleted, onError }: StreamCallbacks,
) => {
  // AI stops thinking and starts writing message
  onWrite();

  // defining variables
  let buffer = "";
  let aiResponse = "";
  let data: IAnswer = {
    model: "",
    created_at: "",
  };

  try {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) throw new Error("No reader available");

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
        data = JSON.parse(trimmed);

        if (data.error) {
          onError(data.error);
          return;
        }

        // handles thinking models
        if (data.message?.thinking) {
          aiResponse += data.message?.thinking;
          let content = data.message?.thinking;
          onData(content);
        }

        if (data.message?.content) {
          aiResponse += data.message?.content;
          onData(data.message?.content);
        }

        if (data.done) break;
      }
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      // store message when abortController.signal.aborted
      await storeMessageAndAnalytics(data, payload, aiResponse, onError);
      onCompleted();
      return;
    } else {
      onError(String(error));
      return;
    }
  }

  // store message when data.done
  await storeMessageAndAnalytics(data, payload, aiResponse, onError);
  // stop loading icons
  onCompleted();
  return;
};

// function to store message and analytics data
const storeMessageAndAnalytics = async (
  data: IAnswer,
  payload: IPayload,
  aiResponse: string,
  onError: (error: any) => void,
) => {
  try {
    const assistantPlaceholder: IMessage = {
      role: data.message?.role || "assistant",
      model: payload.messages.at(-1)!.model,
      content: aiResponse,
      files: undefined,
      images: null
    };
    // create payload
    var payloadFromAI: IPayload = {
      messages: [...payload.messages, assistantPlaceholder],
      isStream: true,
      conversationID: payload.conversationID,
    };
    // store AI message
    const storingResponse = await storeMessage(payloadFromAI);
    if (!storingResponse?.ok)
      throw new Error(
        `Response with status ${storingResponse?.status} while storing the message of the user.`,
      );
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
    // store Analytics
    const analyticsResponse = await addUserAnalytics(analytics);
    if (!analyticsResponse?.ok)
      throw new Error(
        `Response with status ${analyticsResponse?.status} while storing user's analytics.`,
      );
  } catch (err: any) {
    onError(String(err));
  }
};
