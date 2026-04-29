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
          error: "No user has been found with these credentials.",
        },
        { status: 404 },
      );

    logger.info(
      {
        path: "/api/utils/get-email",
      },
      "Get email started",
    );

    // get email
    const response = await pool.query(
      `SELECT
          email
      FROM users
      WHERE userid = $1`,
      [userID],
    );
    if (!response) {
      logger.warn(
        {
          path: "/api/utils/get-email",
        },
        "User lookup failed: Email not found",
      );
      endTimer({
        method: "GET",
        route: "/api/utils/get-email",
        status_code: 404,
      });

      return NextResponse.json(
        { error: "The user could not be found." },
        { status: 404 },
      );
    }

        // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/utils/get-email", status_code: 200 });

    logger.info(
      {
        path: "/api/utils/get-email",
      },
      "Get email succeeded",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/utils/get-email",
      status_code: 500,
    });
    
    logger.error(
      {
        err,
        path: "/api/utils/get-email",
      },
      "Internal server error during email retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
