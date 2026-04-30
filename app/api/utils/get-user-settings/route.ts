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
        path: "/api/utils/get-user-settings",
      },
      "Get user settings started",
    );

    // get user settings
    const response = await pool.query(
      `SELECT
          colortheme, defaultmodel
        FROM users_settings
        WHERE userid = $1`,
      [userID],
    );

    if (!response){
      logger.warn(
        {
          path: "/api/utils/get-user-settings",
        },
        "User settings lookup failed",
      );
      endTimer({
        method: "GET",
        route: "/api/utils/get-user-settings",
        status_code: 404,
      });

      return NextResponse.json(
        { error: "The user settings could not be loaded." },
        { status: 404 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/utils/get-user-settings", status_code: 200 });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/get-user-settings",
      },
      "User settings successfully retrieved",
    );

    return NextResponse.json(
      {
        colortheme: response.rows[0].colortheme,
        defaultmodel: response.rows[0].defaultmodel,
      },
      { status: 200 },
    );
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/utils/get-user-settings",
      status_code: 500,
    });
    
    logger.error(
      {
        err,
        path: "/api/utils/get-user-settings",
      },
      "Internal server error during user settings retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
