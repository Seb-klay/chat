"use client";

import { addUserAnalytics, storeMessage } from ".";
import { availableFunctions, ToolName } from "../tools/tools";
import { IAnswer, IMessage, IPayload, tool } from "../utils/chatUtils";
import { MODELS } from "../utils/listModels";

type StreamCallbacks = {
  onData: (content: string, toolcalls?: tool[]) => void;
  onNewMessage: (newMessage: IMessage) => void;
  onToolCalls: (isCalling: boolean, toolName?: string) => void;
  onReasoning: (isReasoning: boolean) => void;
  onAiWriting: () => void;
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
  // defining variables
  let buffer: string = "";
  let aiResponse = "";
  let data: IAnswer = {
    model: "",
    created: "",
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
  const toolCalls: tool[] = [];
  const toolResults: IMessage[] = [];
  let toolArgs: string = "";
  // ai state variables
  let hasReceivedContent = false;
  let isReasoning = false;
  let hasToolCalls = false;

  try {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) throw new Error("No reader available");

    // stop thought indicator (3 dots) and start writing indicator
    //callbacks.onAiWriting();
    let hasCalledOnAiWriting = false;

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
        if (!trimmed.startsWith("data:")) continue;

        const jsonString = trimmed.slice(5).trim();

        if (jsonString === "[DONE]") break;

        // get content value
        data = JSON.parse(jsonString);
        const delta = data.choices?.[0]?.delta;

        if (data.error) {
          callbacks.onError(data.error);
          return;
        }

        // handles reasoning models
        if (delta?.reasoning) {
          if (!isReasoning) {
            isReasoning = true;
            callbacks.onReasoning(true);
          }

          if (delta.reasoning && typeof delta.reasoning === "string") {
            // collect reasoning here
          }
        } else if (isReasoning) {
          // Only turn off reasoning if it was previously on
          isReasoning = false;
          callbacks.onReasoning(false);
        }

        if (delta?.content) {
          const content = delta.content;

          // First time receiving content
          if (!hasReceivedContent) {
            hasReceivedContent = true;

            // If we're not in reasoning state, switch to writing
            if (!isReasoning) {
              // Only call onAiWriting if we haven't already
              if (!hasCalledOnAiWriting) {
                hasCalledOnAiWriting = true;
                callbacks.onAiWriting();
              }
            }
          }

          aiResponse += content;
          callbacks.onData(content);
        }

        // legacy from ollama : data.message?.tool_calls
        if (delta?.tool_calls && delta?.tool_calls?.length > 0) {
          if (!hasToolCalls) {
            hasToolCalls = true;
            // Get the tool name from the first tool call
            const toolName = delta.tool_calls[0]?.function?.name || "tool";
            callbacks.onToolCalls(true, toolName);
          }

          const toolCallsID = delta.tool_calls.map((call: tool) => call.id);

          if (toolCallsID[0]) {
            toolArgs = ""; // reset toolArgs for each new tool call with id

            delta.tool_calls.map((call: tool) => {
              toolCalls.push({
                id: call.id,
                function: {
                  name: call.function?.name,
                  description: call.function?.description,
                  arguments: call.function?.arguments ?? "",
                },
              });
            });
          } else {
            delta.tool_calls.map((call: tool) => {
              toolArgs += call.function.arguments;
            });

            // Parse arguments when complete
            if (toolArgs.includes("}")) {
              try {
                const parsedArgs = JSON.parse(toolArgs);
                toolCalls[toolCalls.length - 1].function.arguments = parsedArgs;
              } catch (e) {
                //console.warn("Failed to parse tool arguments:", toolArgs);
              }
            }
          }
        }
      }
    }

    // call all tools required from the model and store it in message list
    // const ai_tool_calls = data.choices?.[0]?.delta?.tool_calls
    if (toolCalls && toolCalls.length > 0)
      await Promise.all(
        toolCalls.map(async (call) => {
          callbacks.onToolCalls(true, call.function.name);
          const args = call.function.arguments as { input: string };
          const result = await availableFunctions[
            call.function.name as ToolName
          ](args.input);

          const toolMessage: IMessage = {
            role: "tool",
            content: result?.error ?? JSON.stringify(result?.results),
            model: payload.messages.at(-1)?.model || MODELS[1],
            tool_calls: [call],
          };

          // store tool result
          toolResults.push(toolMessage);
          // store tool message in client message list
          callbacks.onNewMessage(toolMessage);
        }),
      );
  } catch (error: any) {
    if (error.name === "AbortError") {
      // store message when abortController.signal.aborted
      await storeMessageAndAnalytics(
        data,
        payload,
        aiResponse,
        callbacks.onError,
      );
      callbacks.onCompleted();
      return;
    } else {
      callbacks.onError(String(error));
      return;
    }
  }

  callbacks.onToolCalls(false);

  // if toolCalls, resend message
  if (toolCalls.length > 0) {
    const modelPayload: IPayload = {
      ...payload,
      messages: [...payload.messages, ...toolResults],
    };

    await sendChatMessage(modelPayload, abortController, callbacks).catch(
      (error: any) => {
        callbacks.onError(String(error));
      },
    );

    //callbacks.onCompleted();
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
      lastUserIndex === -1 ? 0 : allMessages.length - 1 - lastUserIndex;
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
          `Response with status ${storingResponse?.status} while storing a message.`,
        );
      }
    }
    // store analytics detail
    const analytics: IAnswer = {
      model: data.model,
      created: data.created,
      // new vLLM answer
      usage: {
        prompt_tokens: data.usage?.prompt_tokens, // = prompt_eval_count from ollama
        completion_tokens: data.usage?.completion_tokens, // = eval_count from ollama
        total_tokens: data.usage?.total_tokens,
      },
      // total_duration: data.total_duration,
      // load_duration: data.load_duration,
      // prompt_eval_count: data.prompt_eval_count,
      // prompt_eval_duration: data.prompt_eval_duration,
      // eval_count: data.eval_count,
      // eval_duration: data.eval_duration,
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
