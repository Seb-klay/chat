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
        userID,
        path: "/api/chat/get-user-conversations",
      },
      "Conversation retrieval started",
    );

    // get list of conversations
    const response = await pool.query(
      `SELECT convid, title, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND isdeleted = false
       ORDER BY createdat DESC`,
      [userID],
    );
    if (!response){
      endTimer({
        method: "POST",
        route: "/api/chat/get-user-conversations",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/chat/get-user-conversations",
        },
        "User lookup failed: Email not found",
      );

      return NextResponse.json(
        { error: "Conversations could not be loaded. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/chat/get-user-conversations", status_code: 200 });

    logger.info(
      {
        userID,
        path: "/api/chat/get-user-conversations",
      },
      "Conversations retrieved successfully.",
    );


    return NextResponse.json({ conversations: response.rows }, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/chat/get-user-conversations",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/chat/get-user-conversations",
      },
      "Internal server error during conversation retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
