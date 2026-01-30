"use server";

import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "../../utils/listModels";

export async function POST(request: NextRequest) {
  try {
    const { titleToSummarize, model } = await request.json();
    const aiModel = JSON.parse(model);
    // get AI URL from list
    const AI_MODEL_URL: string = MODELS[aiModel.id].address;
    // send prompt to AI
    const response = await fetch(AI_MODEL_URL + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiModel.model_name,
        prompt: titleToSummarize,
        stream: false,
      }),
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "Title generation failed. " },
        { status: 400 },
      );
    const data = await response.json();

    return NextResponse.json(data.response, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
