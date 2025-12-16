import { NextRequest, NextResponse } from "next/server";
import { IAnswer } from '../../utils/chatUtils';

export async function POST(request: NextRequest):Promise<NextResponse<IAnswer>> {
  const {
    model,
    address,
    prompt,
    isStream
  } = await request.json();

  const response = await fetch(address + "/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      prompt: prompt.map((m: any) => m.prompt).join("\n"),
      stream: isStream,
    }),
  });

  return new NextResponse(response?.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
 }