"use server";

import { NextRequest, NextResponse } from "next/server";
import { IAnswer } from "../../utils/chatUtils";
import { MODELS } from "../../utils/listModels"

// export async function POST(
//   request: NextRequest
// ) {
//   const { messages, isStream } = await request.json();

//   // get AI URL from list
//   const lastMessage = messages[messages.length - 1];
//   const AI_MODEL_URL: string = MODELS[lastMessage.model.id].address

//   console.log("lastMessage")
//   console.log(lastMessage)
//   console.log("aimodelurl")
//   console.log(AI_MODEL_URL)

//     const response = await fetch(AI_MODEL_URL + "/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: lastMessage.model.model_name,
//         prompt: messages.map((m: any) => m.prompt).join("\n"),
//         stream: isStream,
//       }),
//     });

//     console.log(response);

//   return new NextResponse(response.body, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//     },
//   });
// }

// test end-point :
export async function POST(req: Request) {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // We define an array of text "chunks" to simulate the AI typing
  const mockChunks = [
    "Hello! ",
    "I am ",
    "simulating ",
    "a response ",
    "to help ",
    "you test ",
    "your UI.",
        "Hello! ",
    "I am ",
    "simulating ",
    "a response ",
    "to help ",
    "you test ",
    "your UI.",
        "Hello! ",
    "I am ",
    "simulating ",
    "a response ",
    "to help ",
    "you test ",
    "your UI.",
        "Hello! ",
    "I am ",
    "simulating ",
    "a response ",
    "to help ",
    "you test ",
    "your UI."
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of mockChunks) {
        // Create the JSON object matching your model's format
        const payload = JSON.stringify({
          model: "tinyllama",
          created_at: new Date().toISOString(),
          response: chunk,
          done: false
        });

        // Push the encoded JSON + a newline (standard for many stream parsers)
        controller.enqueue(encoder.encode(payload + "\n"));

        // Wait 100ms between chunks to simulate "thinking" time
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Final "done" message
      const finalPayload = JSON.stringify({
        model: "tinyllama",
        created_at: new Date().toISOString(),
        response: "",
        done: true,
        done_reason: "stop",
        context: [529, 29989]
      });
      
      controller.enqueue(encoder.encode(finalPayload + "\n"));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}