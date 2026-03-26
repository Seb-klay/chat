"use client";

import { addUserAnalytics, storeMessage } from ".";
import { availableFunctions, ToolName } from "../tools/tools";
import { IAnswer, IMessage, IPayload, tool } from "../utils/chatUtils";
import { MODELS } from "../utils/listModels";

type StreamCallbacks = {
  onData: (content: string, toolcalls?: tool[]) => void;
  onToolCalls: (toolMessage: IMessage) => void;
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
    // send user input to AI model
    const responseChat = await fetch(`/api/ai-model/chat-messages`, {
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
    await handleStream(responseChat, payload, abortController, callbacks);
  } catch (error: any) {
    callbacks.onError(error);
  }
};

const handleStream = async (
  response: Response,
  payload: IPayload,
  abortController: AbortController,
  callbacks: StreamCallbacks,
) => {
  // AI stops thinking and starts writing message
  callbacks.onWrite();

  // defining variables
  let buffer = "";
  let aiResponse = "";
  let data: IAnswer = {
    model: "",
    created_at: "",
  };
  const toolCalls: tool[] = [];
  const toolResults: IMessage[] = [];

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
          callbacks.onError(data.error);
          return;
        }

        // handles thinking models
        if (data.message?.thinking) {
          aiResponse += data.message?.thinking;
          callbacks.onData(data.message?.thinking);
        }

        if (data.message?.content) {
          aiResponse += data.message?.content;
          callbacks.onData(data.message?.content);
        }

        if (data.message?.tool_calls && data.message?.tool_calls?.length > 0) {
          callbacks.onData("", data.message.tool_calls)
          toolCalls.push(...data.message.tool_calls);
        }

        if (data.done) break;
      }

      // call all tools required from the model and store it in message list
      if (data.message?.tool_calls && data.message?.tool_calls?.length > 0)
        await Promise.all(
          toolCalls.map(async (call) => {
            const args = call.function.arguments as { input: string };
            const result = await availableFunctions[
              call.function.name as ToolName
            ](args.input);

            const toolMessage: IMessage = {
              role: "tool",
              content: result || "Error",
              model: payload.messages.at(-1)?.model || MODELS[1],
              tool_calls: [call],
            };

            toolResults.push(toolMessage)

            // store tool message in client message list
            callbacks.onToolCalls(toolMessage);
          }),
        );
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      // store message when abortController.signal.aborted
      await storeMessageAndAnalytics(data, payload, aiResponse, callbacks.onError);
      callbacks.onCompleted();
      return;
    } else {
      callbacks.onError(String(error));
      return;
    }
  }

  // if toolCalls, resend message
  if (toolCalls.length > 0) {
    const modelPayload: IPayload = {
      ...payload,
      messages: [...payload.messages, ...toolResults]
    }

    await sendChatMessage(modelPayload, abortController, callbacks).catch((error: any) => {
      callbacks.onError(String(error));
    });

    callbacks.onCompleted();
    return;
  }

  // store message when data.done
  await storeMessageAndAnalytics(data, payload, aiResponse, callbacks.onError);
  // stop loading icons
  callbacks.onCompleted();
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
    };
    // create payload
    var payloadFromAI: IPayload = {
      ...payload,
      messages: [...payload.messages, assistantPlaceholder],
    };
    // get last messages to store them all
    const allMessages = payloadFromAI.messages;
    // find last user message index
    const lastUserIndex = [...allMessages]
      .reverse()
      .findIndex((msg) => msg.role === "user");
    // convert reverse index → normal index
    const startIndex =
      lastUserIndex === -1
        ? 0
        : allMessages.length - 1 - lastUserIndex;
    // slice the conversation block
    const latestConversation = allMessages.slice(startIndex);

    // store all messages
    for (const message of latestConversation) {
      const payloadToStore: IPayload = {
        ...payload,
        messages: [message],
      };

      const storingResponse = await storeMessage(payloadToStore);

      if (!storingResponse?.ok) {
        throw new Error(
          `Response with status ${storingResponse?.status} while storing a message.`
        );
      }
    }
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
