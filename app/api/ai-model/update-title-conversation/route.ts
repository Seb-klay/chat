"use server";

import { NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function PUT(request: Request): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const { id, newTitle } = await request.json();
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
        path: "/api/ai-model/update-title-conversation",
      },
      "Conversation title update attempt started",
    );

    // update title conversation
    const response = await pool.query(
      `UPDATE conversations
        SET title = $1, updatedat = $2
        WHERE convid = $3`,
      [newTitle, new Date(Date.now()), id],
    );

    if (!response) {
      endTimer({
        method: "PUT",
        route: "/api/ai-model/update-title-conversation",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/ai-model/update-title-conversation",
        },
        "Conversation title update failed: Conversation could not be updated",
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "PUT", route: "/api/ai-model/update-title-conversation", status_code: 200 });

    logger.info(
      {
        path: "/api/ai-model/update-title-conversation",
      },
      "Conversation title updated successfully.",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "PUT",
      route: "/api/ai-model/update-title-conversation",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/ai-model/update-title-conversation",
      },
      "Internal server error during conversation title update",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
