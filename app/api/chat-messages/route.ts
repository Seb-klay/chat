"use server";

import { NextRequest, NextResponse } from "next/server";
import { IAnswer } from "../../utils/chatUtils";
import { MODELS } from "../../utils/listModels"

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const { messages, isStream } = await request.json();

  // get AI URL from list
  const lastMessage = messages[messages.length - 1];
  const AI_MODEL_URL: string = MODELS[lastMessage.model.id].address

  try {
    const response = await fetch(AI_MODEL_URL + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: lastMessage.model.model_name,
        prompt: messages.map((m: any) => m.prompt).join("\n"),
        stream: isStream,
      }),
    });

    if (!response.ok) {
      throw new Error();
    }

    return new NextResponse<IAnswer>(response?.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}