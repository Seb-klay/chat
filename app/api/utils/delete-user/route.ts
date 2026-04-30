"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const pool = getPool();
    if (!userID)
      return NextResponse.json(
        { error: "Conversation ID is required. " },
        { status: 404 },
      );

    logger.info(
      {
        userId: userID,
        path: "/api/utils/delete-user",
      },
      "User deletion started",
    );
    // Delete conversation
    const response = await pool.query(
      `UPDATE users
       SET isDeleted = true
       WHERE userid = $1
       RETURNING *`,
      [userID],
    );
    if (response.rowCount === 0) {
      endTimer({
        method: "DELETE",
        route: "/api/utils/delete-user",
        status_code: 404,
      });

      logger.warn(
        {
          userId: userID,
          path: "/api/utils/delete-user",
        },
        "User deletion failed",
      );

      return NextResponse.json(
        { error: "User could not be found. " },
        { status: 404 },
      );
    }

    // Stop the timer and record the duration
    endTimer({
      method: "DELETE",
      route: "/api/utils/delete-user",
      status_code: 200,
    });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/delete-user",
      },
      "User deletion succeeded",
    );

    return NextResponse.json(response.rows[0], { status: 200 });
  } catch (err) {
    endTimer({
      method: "DELETE",
      route: "/api/utils/delete-user",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/delete-user",
      },
      "Internal server error during user deletion",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
