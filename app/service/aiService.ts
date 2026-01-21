"use client";

import { storeMessage } from ".";
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
    const response = await fetch(`/api/chat-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Pass the stream to the handler
    await handleStream(response, callbacks);
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
  { onData, onWrite, onCompleted, onError }: StreamCallbacks
) => {

  // AI stops thinking and starts writing message
  onWrite();

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) throw new Error("No reader available");

  let buffer = "";

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
          onData(data.response);
        }

        if (data.done === true) {
          onCompleted();
          return;
        }
      } catch (e) {
        onError("Error parsing stream chunk" + e);
      }
    }
  }
};
