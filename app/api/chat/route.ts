import { NextRequest, NextResponse } from "next/server";
import { IAnswer } from '../../utils/chatUtils';

export async function POST(request: NextRequest):Promise<NextResponse<IAnswer>> {
  const message = await request.json();
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: message.model, // or "phi"
      prompt: message.prompt.map((m: any) => m.prompt).join("\n"),
      stream: message.stream,
    }),
  });

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close() 
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        decoder.decode(value)
        const chunk = decoder.decode(value);
        try {
            const json:IAnswer = JSON.parse(chunk);
            if (json.response) {
              controller.enqueue(
                encoder.encode(json.response)
              );
            }
            else {
                controller.close();
                console.log('has been closed')
            }
          } catch {
            // skip partial JSON chunks
            console.error("error to handle");
          }
        }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
 }