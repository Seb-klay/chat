"use server";

import { NextRequest, NextResponse } from "next/server";
import { IMessage } from "@/app/utils/chatUtils";
import { extractTextFromFiles, IExtractResult } from "@/app/utils/pdf-parser";
import { tools } from "@/app/tools/tools";

export async function POST(request: NextRequest) {
  try {
    const { messages, isStream } = await request.json();
    // get AI URL from list
    const lastMessage: IMessage = messages[messages.length - 1];
    const model =
      typeof lastMessage.model === "string"
        ? JSON.parse(lastMessage.model)
        : lastMessage.model;
    const AI_MODEL_URL: string | undefined = process.env.LLM_URL;
    
    // prepare files for model
    let result: IExtractResult | null = null;
    let filesText: string[] | undefined = [];
    let filesImages: string[] | null = null;
    const files = lastMessage.files;

    if (files && files?.length > 0) {
      const pdfResponse = await extractTextFromFiles(files);
      
      if (pdfResponse) {
        result = pdfResponse;
        result?.text?.map(file => {
          if (file.data)
            filesText.push(file.data)
        }
        );
        filesImages = result.images;
      } else {
        throw new Error("Error while parsing files.")
      }
    }

    // send request to AI
    //const OLLAMA_URL = '/api/chat' // if used with OLLAMA (legacy)
    const vllm_URL = '/v1/chat/completions' // if used with vLLM for prod

    const response = await fetch(AI_MODEL_URL + vllm_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.model_name,
        messages: messages.map((m: IMessage) => ({
          role: m.role,
          content: m.content + "\n\n" + filesText.join('\n\n'),
          //images: filesImages ?? [],
        })),
        stream: isStream,
        reasoning_effort: "none", // none, low, medium, high,
        stream_options: {
          include_usage: true
        },
        // tool_choice: "auto" // "none" or "auto" or "required"
        // tools: tools,
        // verbosity: "medium" // "low" or "medium" or "high"
      }),
    });
    if (!response.ok) {
      const errorDetails = await response.json();
      return NextResponse.json(
        { error: "AI message could not be generated: " + errorDetails },
        { status: 400 },
      );
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}

// test end-point for tool calling :
// export async function POST(request: NextRequest) {
//   try {
//     const { messages } = await request.json();
//     console.log(messages);

//     const hasToolResult = messages?.some((m: any) => m.role === "tool");

//     const encoder = new TextEncoder();

//     // Helper to enqueue JSON line (without "data:" prefix)
//     const enqueueJson = (controller: any, payload: object) => {
//       controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
//     };

//     if (hasToolResult) {
//       // Tool call stream
//       const stream = new ReadableStream({
//         start(controller) {
//           const payload = {
//             model: "deepseek-r1:700b",
//             created_at: new Date().toISOString(),
//             message: {
//               role: "assistant",
//               content: "",
//               tool_calls: [
//                 {
//                   function: {
//                     name: "search",
//                     arguments: {
//                       input: "What is the current price for Tesla stock market?",
//                     },
//                   },
//                 },
//               ],
//             },
//             done: true,
//           };

//           enqueueJson(controller, payload);
//           controller.close();
//         },
//       });

//       return new NextResponse(stream, {
//         headers: {
//           "Content-Type": "text/event-stream",
//           "Cache-Control": "no-cache",
//           Connection: "keep-alive",
//         },
//       });
//     }

//     // Normal streaming response
//     const mockChunks = [
//       "Hello! ",
//       "I am ",
//       "simulating ",
//       "a response ",
//       "to help ",
//       "you test ",
//       "your UI. ",
//     ];

//     const stream = new ReadableStream({
//       async start(controller) {
//         // stream each chunk
//         for (const chunk of mockChunks) {
//           enqueueJson(controller, {
//             model: "deepseek-r1:7b",
//             created_at: new Date().toISOString(),
//             message: {
//               role: "assistant",
//               content: chunk,
//             },
//             done: false,
//           });

//           // simulate typing delay
//           await new Promise((r) => setTimeout(r, 150));
//         }

//         // final "done" message
//         enqueueJson(controller, {
//           model: "deepseek-r1:7b",
//           created_at: new Date().toISOString(),
//           message: {
//             role: "assistant",
//             content: "",
//           },
//           done: true,
//           total_duration: 82617974642,
//           load_duration: 69127099622,
//           prompt_eval_count: 44,
//           prompt_eval_duration: 6792859223,
//           eval_count: 20,
//           eval_duration: 6269251027,
//         });

//         controller.close();
//       },
//     });

//     return new NextResponse(stream, {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   } catch (err) {
//     console.error("POST error:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// test end-point :
// export async function POST(req: Request) {
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   // We define an array of text "chunks" to simulate the AI typing
//   const mockChunks = [
//     "Hello! ",
//     "I am ",
//     "simulating ",
//     "a response ",
//     "to help ",
//     "you test ",
//     "your UI.",
//         "Hello! ",
//     "I am ",
//     "simulating ",
//     "a response ",
//     "to help ",
//     "you test ",
//     "your UI.",
//         "Hello! ",
//     "I am ",
//     "simulating ",
//     "a response ",
//     "to help ",
//     "you test ",
//     "your UI.",
//         "Hello! ",
//     "I am ",
//     "simulating ",
//     "a response ",
//     "to help ",
//     "you test ",
//     "your UI."
//   ];

//   const encoder = new TextEncoder();

//   const stream = new ReadableStream({
//     async start(controller) {
//       for (const chunk of mockChunks) {
//         // Create the JSON object matching your model's format
//         const payload = JSON.stringify({
//           model: "llama3.2:3b",
//           created_at: new Date().toISOString(),
//           message: {
//             content: chunk
//           },
//           done: false,
//           total_duration: 82617974642,
//           load_duration: 69127099622,
//           prompt_eval_count: 44,
//           prompt_eval_duration: 6792859223,
//           eval_count: 20,
//           eval_duration: 6269251027
//         });

//         // Push the encoded JSON + a newline (standard for many stream parsers)
//         controller.enqueue(encoder.encode(payload + "\n"));

//         // Wait 100ms between chunks to simulate "thinking" time
//         await new Promise((resolve) => setTimeout(resolve, 100));
//       }
//       controller.close();
//     },
//   });

//   return new NextResponse(stream, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       "Connection": "keep-alive",
//     },
//   });
// }
