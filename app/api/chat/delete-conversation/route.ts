'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // Get the conversation ID from the URL query
    const { id } = await request.json();
    const pool = getPool();
    if (!id) return NextResponse.json({ error: "Conversation ID is required. "}, { status: 404 });

    logger.info(
      {
        path: "/api/chat/delete-conversation",
      },
      "Authentication attempt started",
    );
    
    // Delete conversation
    const response = await pool.query(
      `UPDATE conversations
       SET isDeleted = true, updatedat = $1
       WHERE convid = $2
       RETURNING *`,
      [new Date(Date.now()), id]
    );
    if (response.rowCount === 0) {
      endTimer({
        method: "DELETE",
        route: "/api/chat/delete-conversation",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/chat/delete-conversation",
        },
        "Conversation deletion failed: Conversation not found",
      );

      return NextResponse.json({ error: "Conversation could not be found. "}, { status: 404 });
    }

    // Stop the timer and record the duration
    endTimer({ method: "DELETE", route: "/api/chat/delete-conversation", status_code: 200 });

    logger.info(
      {
        path: "/api/chat/delete-conversation",
      },
      "Conversation deleted successfully.",
    );

    return NextResponse.json(response.rows[0], { status: 200 });
  } catch (err) {
    endTimer({
      method: "DELETE",
      route: "/api/chat/delete-conversation",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/chat/delete-conversation",
      },
      "Internal server error during conversation deletion",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
