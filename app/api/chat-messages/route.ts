"use server";

import { NextRequest, NextResponse } from "next/server";
import { IAnswer } from "../../utils/chatUtils";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const { model, address, prompt, isStream } = await request.json();

  try {
    const response = await fetch(address + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt.map((m: any) => m.prompt).join("\n"),
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