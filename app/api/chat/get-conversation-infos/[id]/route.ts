'use server'

import { NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const { id } = await params;
    const pool = getPool();
    if (!userID) return NextResponse.json({ error: "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation."}, { status: 404 });

    logger.info(
      {
        path: "/api/chat/get-conversation-infos/[id]",
      },
      "Authentication attempt started",
    );

    // Get conversation infos
    const response = await pool.query(
      `SELECT convid, title, defaultModel, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND convid = $2
       AND isdeleted = false`,
      [userID, id]
    );
    if (!response) {
      endTimer({
        method: "GET",
        route: "/api/chat/get-conversation-infos/[id]",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/chat/get-conversation-infos/[id]",
        },
        "Conversation info lookup failed: Conversation not found",
      );

      return NextResponse.json({ error: "Conversation info could not be loaded. "}, { status: 400 });
    }

    // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/chat/get-conversation-infos/[id]", status_code: 200 });

    logger.info(
      {
        path: "/api/chat/get-conversation-infos/[id]",
      },
      "Conversation info retrieved successfully.",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/chat/get-conversation-infos/[id]",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/chat/get-conversation-infos/[id]",
      },
      "Internal server error during conversation info retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}