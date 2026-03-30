'use server'

import { NextResponse } from "next/server";
import { SearxngService, SearxngServiceConfig } from "searxng";

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
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("q");

    if (!input) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    const searxngService = new SearxngService(searxConfig);
    console.log(searxConfig)
    console.log(searxngService)
    const results = await searxngService.search(input);
    // for test purposes only !
    //const results = "The stock market of tesla grew up to 15% which value the company to 1 trillion today !"

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.error("Search API error:", err);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}