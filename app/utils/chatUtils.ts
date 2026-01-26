import { IConversation } from "../conversation/[id]/page";
import { summaryConversation, updateTitleConversation } from "../service/index";
import { IModelList } from "./listModels";

type role = "user" | "assistant" | "system";

export interface IMessage {
  role: role;
  model: {
    id: number;
  };
  prompt: string;
}

export interface IPayload {
  messages: IMessage[];
  isStream: boolean;
  conversationID: string | string[] | undefined;
}

export interface IAnswer {
  model: string;
  created_at: string;
  response?: string;
  done?: boolean;
  done_reason?: string;
  context?: number[];
  total_duration?: number;         // The total time from when you hit "send" to when the AI finished the final word.
  load_duration?: number;          // Time spent loading the model from your disk into your RAM/GPU.
  prompt_eval_count?: number;            // Your input prompt was 52 tokens long.
  prompt_eval_duration?: number;    // How long it took the AI to "read" and understand your prompt before it started writing.
  eval_count?: number;                       // The AI's response ("Discussing love is my current desire.") was 9 tokens long.
  eval_duration?: number;      
}
// {"model":"tinyllama","created_at":"2025-10-16T17:56:49.249317848Z","response":"","done":true,"done_reason":"stop","context":[529,29989]

export const summaryConversationAndUpdate = async (
  newConversation: IConversation
) => {
  const titleToSummarize =
    "Summarize this text in 6 words : " + newConversation.title;

  // const response = await summaryConversation(titleToSummarize, newConversation.defaultmodel).catch((err) => {
  //   throw new Error("Could not generate new title of conversation. " + err);
  // });

  // const newTitle = await response.json();
  const newTitle = "--- Test title written by me ---";

  const response = await updateTitleConversation(
    newConversation.convid,
    newTitle
  ).catch((err) => {
    throw new Error("Could not update new title of conversation. " + err);
  });

  if (!response) throw new Error("Could not store AI generated title.");

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
};

// ----- full example of end answer for analytics purposes later -----
// {
//   model: 'llama3.2:3b',
//   created_at: '2026-01-22T08:46:16.504911807Z',
//   response: 'Discussing love is my current desire.',
//   done: true,
//   done_reason: 'stop',
//   context: [                            The context is a numerical representation (a list of token IDs) of the entire conversation up to this point.
//     128006,   9125, 128007,    271,  38766,   1303,
//      33025,   2696,     25,   6790,    220,   2366,
//         18,    271, 128009, 128006,    882, 128007,
//        271,   9370,   5730,    553,    420,   1495,
//        304,    220,     21,   4339,    551,   8279,
//       5730,    553,    420,   1495,    304,    220,
//         21,   4339,    551,    602,   1390,    311,
//       3137,    922,   3021,   1457, 128009, 128006,
//      78191, 128007,    271,  97654,    287,   3021,
//        374,    856,   1510,  12876,     13
//   ],
//   total_duration: 10749857499,         The total time from when you hit "send" to when the AI finished the final word.
//   load_duration: 1092172437,           Time spent loading the model from your disk into your RAM/GPU.
//   prompt_eval_count: 52,               Your input prompt was 52 tokens long.
//   prompt_eval_duration: 202154321,     How long it took the AI to "read" and understand your prompt before it started writing.
//   eval_count: 9,                       The AI's response ("Discussing love is my current desire.") was 9 tokens long.
//   eval_duration: 2568946048            The actual time spent generating the words in the response.

// ----- infos for billing. -----
// user_id: To track which user is consuming your budget.
// prompt_tokens (prompt_eval_count): The "input" cost.
// completion_tokens (eval_count): The "output" cost (usually more expensive in paid APIs).
// total_tokens: Sum of the two above.
// model_name: Very important, as Llama 3.2:3b costs less than a 70b model.

// ----- perfs and analytics data -----
// total_duration: Total round-trip time (ms).
// eval_duration: Actual generation time.
// tokens_per_second: Calculate this before saving: eval_count/(eval_duration/10
// 9
//  ).
// timestamp: To track usage over time (daily/monthly).
