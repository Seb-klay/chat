import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IAnswer } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get user id in cookie
    const sessionUser = await verifySession();
    const pool = getPool();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        {
          error:
            "User could not be found with these credentials. Try again please. ",
        },
        { status: 404 },
      );

    logger.info(
      {
        userID,
        path: "/api/utils/user-analytics",
      },
      "User analytics update attempt started",
    );

    const analytics = (await request.json()) as IAnswer;
    const {
      created,
      usage,
      model,
      // total_duration,
      // load_duration,
      // prompt_eval_count,
      // prompt_eval_duration,
      // eval_count,
      // eval_duration,
    } = analytics;
    // update user analytics
    const response = await pool.query(
      `INSERT INTO users_analytics 
      (userid, created_at, prompt_tokens, completion_tokens, total_tokens, defaultmodel) 
      values ($1, TO_TIMESTAMP($2), $3, $4, $5, $6)`,
      [
        userID,
        created,
        usage?.prompt_tokens,
        usage?.completion_tokens,
        usage?.total_tokens,
        model,
        // total_duration,
        // load_duration,
        // prompt_eval_count,
        // prompt_eval_duration,
        // eval_count,
        // eval_duration,
      ],
    );
    if (!response) {
      logger.warn(
        {
          userID,
          path: "/api/utils/user-analytics",
        },
        "User lookup failed: Email not found",
      );

      endTimer({
        method: "POST",
        route: "/api/utils/user-analytics",
        status_code: 404,
      });

      return NextResponse.json({ error: "Analytics could not be updated. " });
    }

    // Stop the timer and record the duration
    endTimer({
      method: "POST",
      route: "/api/utils/user-analytics",
      status_code: 200,
    });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/user-analytics",
      },
      "User successfully retrieved",
    );

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/user-analytics",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/user-analytics",
      },
      "Internal server error during user analytics update",
    );
    
    return NextResponse.json(err, { status: 500 });
  }
}
