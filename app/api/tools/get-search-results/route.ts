"use server";

import { NextResponse } from "next/server";
import {
  SearxngSearchResult,
  SearxngService,
  SearxngServiceConfig,
} from "searxng";
import { logger, httpRequestDuration } from "@/app/utils/logger";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import playwright from "playwright";

const searxConfig: SearxngServiceConfig = {
  baseURL: process.env.SEARXNG_INSTANCE!,
  defaultSearchParams: {
    format: "json",
    lang: "auto",
  },
  defaultRequestHeaders: {
    "Content-Type": "application/json",
  },
};

// Utility function to clean and normalize text content
function cleanText(text: string): string {
  return (
    text
      // Remove weird unicode
      .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "")

      // Remove isolated numbers
      .replace(/^\d+$/gm, "")

      // Remove URLs
      .replace(/https?:\/\/\S+/g, "")

      // Collapse whitespace
      .replace(/[ \t]+/g, " ")

      // Collapse newlines
      .replace(/\n{3,}/g, "\n\n")

      // Remove repeated punctuation
      .replace(/([!?.,]){2,}/g, "$1")

      // Trim
      .trim()
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("q");

    if (!input) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 },
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
    // const results = {
    //   query: "openai",
    //   number_of_results: 1230000,
    //   results: [
    //     {
    //       url: "https://openai.com/",
    //       title: "OpenAI",
    //       content: "OpenAI develops artificial intelligence systems...",
    //       engine: "duckduckgo",
    //       score: 12.5,
    //       publishedDate: "2026-05-10",
    //       category: "general",
    //     },
    //     {
    //       url: "https://platform.openai.com/docs",
    //       title: "OpenAI API Docs",
    //       content: "Learn how to use the OpenAI API...",
    //       engine: "bing",
    //       score: 10.2,
    //     },
    //   ],
    //   answers: [],
    //   suggestions: [],
    //   infoboxes: [],
    // };

    const webArticles: SearxngSearchResult[] = [];
    for (const res of results.results.slice(0, 10)) {
      if (webArticles.length >= 3) break;

      if (
        !res.url.startsWith("http") ||
        res.url.includes("youtube.com") ||
        res.url.includes("reddit.com")
      ) {
        continue;
      }

      try {
        const response = await fetch(res.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });
        const html = await response.text();

        // if first time doesn't work, try with playwright to render potential dynamic content (like with react)
        let pw_html = undefined;
        if (!html || html.length === 0) {
          const browser = await playwright["firefox"].launch();
          try {
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto(res.url, {
              waitUntil: "domcontentloaded",
              timeout: 10000,
            });
            await page.waitForTimeout(2000);

            pw_html = await page.content();

            if (!pw_html) continue;
          } catch (err) {
            logger.warn(
              {
                err,
                url: res.url,
              },
              "Failed to fetch or parse content for URL using Playwright.",
            );
          } finally {
            await browser.close();
          }
        }

        const contentToParse = html && html.length > 0 ? html : pw_html;
        const dom = new JSDOM(contentToParse, { url: res.url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article?.textContent) continue;

        res.content = cleanText(article.textContent.substring(0, 1500));
        webArticles.push(res);
      } catch (err) {
        logger.warn(
          {
            err,
            url: res.url,
          },
          "Failed to fetch or parse content for URL.",
        );
      }
    }

    endTimer({
      method: "GET",
      route: "/api/tools/get-search-results",
      status_code: 200,
    });

    logger.info(
      {
        path: "/api/tools/get-search-results",
      },
      "Search attempt finished successfully.",
    );

    return NextResponse.json({ results: webArticles }, { status: 200 });
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

    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
