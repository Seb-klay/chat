'use server'

import { NextResponse } from "next/server";
import { SearxngService, SearxngServiceConfig } from "searxng";
import { logger, httpRequestDuration } from "@/app/utils/logger";

const searxConfig: SearxngServiceConfig = {
  baseURL: process.env.SEARXNG_INSTANCE!,
  defaultSearchParams: {
    //format: 'json',
    lang: 'auto',
  },
  defaultRequestHeaders: {
    'Content-Type': 'application/json',
  },
};

export async function GET(request: Request): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("q");

    if (!input) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    logger.info(
      {
        path: "/api/tools/get-search-results",
      },
      "Search attempt started",
    );

    const searxngService = new SearxngService(searxConfig);
    const results = await searxngService.search(input);
    // for test purposes only !
    //const results = "The stock market of tesla grew up to 15% which value the company to 1 trillion today !"

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/tools/get-search-results",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/tools/get-search-results",
      },
      "Internal server error during search",
    );

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}