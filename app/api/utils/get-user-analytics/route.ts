"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const pool = getPool();
    if (!userID)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );

    logger.info(
      {
        path: "/api/utils/get-user-analytics",
      },
      "Get user analytics started",
    );

    // get analytics of one user of the last 7 days
    const response = await pool.query(
      `SELECT
          DATE(created_at) AS day,
          defaultModel AS model,
          COUNT(*) AS requests,
          -- vLLM metrics (new)
          SUM(prompt_tokens) AS prompt_tokens,
          SUM(completion_tokens) AS completion_tokens,
          SUM(total_tokens) AS total_tokens,
          -- Legacy Ollama metrics (for backward compatibility)
          SUM(total_duration) AS total_duration,
          SUM(load_duration) AS load_duration,
          SUM(prompt_eval_count) AS prompt_eval_count,
          SUM(prompt_eval_duration) AS prompt_eval_duration,
          SUM(eval_count) AS eval_count,
          SUM(eval_duration) AS eval_duration
        FROM Users_analytics
        WHERE userID = $1
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY day, defaultModel
        ORDER BY day ASC, defaultModel;`,
      [userID],
    );
    if (!response) {
      logger.warn(
        {
          path: "/api/utils/get-user-analytics",
        },
        "User analytics lookup failed.",
      );
      endTimer({
        method: "GET",
        route: "/api/utils/get-user-analytics",
        status_code: 404,
      });
      return NextResponse.json(
        { error: "Analytics could not be loaded. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({
      method: "GET",
      route: "/api/utils/get-user-analytics",
      status_code: 200,
    });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/get-user-analytics",
      },
      "Analytics successfully retrieved",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/utils/get-user-analytics",
      status_code: 500,
    });
    
    logger.error(
      {
        err,
        path: "/api/utils/get-user-analytics",
      },
      "Internal server error during analytics retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
