"use server";

import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest) {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { titleToSummarize, model } = await request.json();
    const aiModel = JSON.parse(model);
    // get AI URL from list
    const AI_MODEL_URL: string | undefined = process.env.LLM_URL;
    // send prompt to AI
    //const OLLAMA_URL = '/api/generate' // if used with OLLAMA for test
    const vllm_URL = '/v1/responses' // if used with vLLM for prod

    logger.info(
      {
        path: "/api/ai-model/generate-title",
      },
      "Title generation attempt started",
    );

    const response = await fetch(AI_MODEL_URL + vllm_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiModel.model_name, // taking a lightweight model for title summarisation
        prompt: titleToSummarize,
        stream: false,
      }),
    });
    if (!response.ok){
      endTimer({
        method: "POST",
        route: "/api/ai-model/generate-title",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/ai-model/generate-title",
        },
        "Title generation failed: AI model could not generate a title",
      );

      return NextResponse.json(
        { error: "Title generation failed. " },
        { status: 400 },
      );
    }
    const data = await response.json();

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/ai-model/generate-title", status_code: 200 });

    logger.info(
      {
        path: "/api/ai-model/generate-title",
      },
      "Title generated successfully.",
    );

    return NextResponse.json(data.response, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/ai-model/generate-title",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/ai-model/generate-title",
      },
      "Internal server error during title generation",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
