"use server";

import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "../../utils/listModels";
import { IMessage } from "@/app/utils/chatUtils";
import { extractTextFromFiles, IExtractResult } from "@/app/utils/pdf-parser";

export async function POST(request: NextRequest) {
  try {
    const { messages, isStream } = await request.json();
    // get AI URL from list
    const lastMessage: IMessage = messages[messages.length - 1];
    const model =
      typeof lastMessage.model === "string"
        ? JSON.parse(lastMessage.model)
        : lastMessage.model;
    const AI_MODEL_URL: string | undefined = MODELS[model.id].address;
    
    // prepare files for model
    let result: IExtractResult | null = null;
    let filesText: string | undefined = undefined;
    let filesImages: string[] | null = null;
    const files = lastMessage.files;

    if (files && files?.length > 0) {
      //const preparedFiles = await prepareFilesForServer(files);
      const pdfResponse = await extractTextFromFiles(files);
      
      if (pdfResponse) {
        result = pdfResponse;
        filesText = result?.text?.map(file => 
          Buffer.from(file.data, 'base64').toString('utf-8')
        ).join('\n\n');
        filesImages = result.images;
      } else {
        throw new Error("Error while parsing files.")
      }
    }

    // send request to AI
    const response = await fetch(AI_MODEL_URL + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.model_name,
        messages: messages.map((m: IMessage) => ({
          role: m.role,
          content: m.content + "\n\n" + filesText,
          images: filesImages ?? [],
        })),
        think: false,
        stream: isStream,
      }),
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "AI message could not be generated. " },
        { status: 400 },
      );

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
//           response: chunk,
//           done: false
//         });

//         // Push the encoded JSON + a newline (standard for many stream parsers)
//         controller.enqueue(encoder.encode(payload + "\n"));

//         // Wait 100ms between chunks to simulate "thinking" time
//         await new Promise((resolve) => setTimeout(resolve, 100));
//       }

//       // Final "done" message
//       const finalPayload = JSON.stringify({
//         model: 'llama3.2:3b',
//         created_at: '2026-01-25T17:32:51.861260784Z',
//         total_duration: 82617974642,
//         load_duration: 69127099622,
//         prompt_eval_count: 44,
//         prompt_eval_duration: 6792859223,
//         eval_count: 20,
//         eval_duration: 6269251027
//       });

//       controller.enqueue(encoder.encode(finalPayload + "\n"));
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
