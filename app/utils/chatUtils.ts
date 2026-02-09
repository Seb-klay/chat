import { IConversation } from "../(main)/conversation/[id]/page";
import { summaryConversation, updateTitleConversation } from "../service/index";
import { useRouter } from 'next/router'

type role = "user" | "assistant" | "system";

export interface IMessage {
  role: role;
  model: {
    id: number;
  };
  content: string;
}

export interface IPayload {
  messages: IMessage[];
  isStream: boolean;
  conversationID: string | string[] | undefined;
}

export interface IAnswer {
  model: string;
  created_at: string;
  response?: string; // for api/generate
  message?: {
    // for api/chat
    role: role;
    content: string;
  };
  done?: boolean;
  done_reason?: string;
  context?: number[];
  total_duration?: number; // The total time from when you hit "send" to when the AI finished the final word.
  load_duration?: number; // Time spent loading the model from your disk into your RAM/GPU.
  prompt_eval_count?: number; // Your input prompt was 52 tokens long.
  prompt_eval_duration?: number; // How long it took the AI to "read" and understand your prompt before it started writing.
  eval_count?: number; // The AI's response ("Discussing love is my current desire.") was 9 tokens long.
  eval_duration?: number;
}
// {"model":"tinyllama","created_at":"2025-10-16T17:56:49.249317848Z","response":"","done":true,"done_reason":"stop","context":[529,29989]

type ErrorCallbacks = {
  onError: (error: any) => void;
};

export const summaryConversationAndUpdate = async (
  newConversation: IConversation,
  { onError }: ErrorCallbacks,
) => {
  try {
    const titleToSummarize =
      "Summarize this text in 6 words : " + newConversation.title;

    // get summary for new title
    const responseSummary = await summaryConversation(
      titleToSummarize,
      newConversation.defaultmodel,
    );
    if (!responseSummary?.ok)
      onError(
        `Could not store AI generated title with status ${responseSummary.status}.`,
      );

    const newTitle = await responseSummary.json();
    // update new generated title
    const responseUpdatedTitle = await updateTitleConversation(
      newConversation.convid,
      newTitle,
    );
    if (!responseUpdatedTitle?.ok)
      onError(`Could not store AI generated title ${responseSummary.status}.`);

    // add event emitter
    const updatedConversation = {
      ...newConversation,
      title: newTitle,
    };
    const event = new CustomEvent("chat-created", {
      detail: updatedConversation,
    });
    window.dispatchEvent(event);

    return updatedConversation;
  } catch (err) {
    throw new Error("Could not summarize conversation title : " + err);
  }
};