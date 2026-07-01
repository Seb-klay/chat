"use server";

import { NextRequest, NextResponse } from "next/server";
import { IMessage } from "@/app/utils/chatUtils";
import { tools } from "@/app/tools/tools";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest) {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { messages, isStream } = await request.json();
    // get AI URL from list
    const lastMessage: IMessage = messages[messages.length - 1];
    const model =
      typeof lastMessage.model === "string"
        ? JSON.parse(lastMessage.model)
        : lastMessage.model;
    const AI_MODEL_URL: string | undefined = process.env.LLM_URL;

    // send request to AI
    //const OLLAMA_URL = '/api/chat' // if used with OLLAMA (legacy)
    const vllm_URL = '/v1/chat/completions' // if used with vLLM for prod

    logger.info(
      {
        path: "/api/ai-model/chat-messages",
      },
      "Chat message generation attempt started",
    );

    const response = await fetch(AI_MODEL_URL + vllm_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.model_name,
        messages: messages.map((m: IMessage) => ({
          role: m.role,
          content: m.content + "\n\n" + (m.files?.map(f => f.data).join("\n\n") ?? ""),
          //images: filesImages ?? [],
        })),
        stream: isStream,
        reasoning_effort: "none", // none, low, medium, high,
        stream_options: {
          include_usage: true
        },
        tool_choice: "auto", // "none" or "auto" or "required"
        tools: tools,
        verbosity: "medium" // "low" or "medium" or "high"
      }),
    });
    if (!response.ok) {
      endTimer({
        method: "POST",
        route: "/api/ai-model/chat-messages",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/ai-model/chat-messages",
        },
        "Chat message generation failed: AI model could not generate a message",
      );

      const errorDetails = await response.json();
      return NextResponse.json(
        { error: "AI message could not be generated: " + errorDetails },
        { status: 400 },
      );
    }

    endTimer({ method: "POST", route: "/api/ai-model/chat-messages", status_code: 200 });

    logger.info(
      {
        path: "/api/ai-model/chat-messages",
      },
      "Chat message generated successfully.",
    );

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/ai-model/chat-messages",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/ai-model/chat-messages",
      },
      "Internal server error during chat message generation",
    );

    return NextResponse.json(err, { status: 500 });
  }
}