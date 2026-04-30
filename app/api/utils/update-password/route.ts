"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function PUT(request: NextRequest): Promise<NextResponse> {
const endTimer = httpRequestDuration.startTimer();

  try {
    const { newPassword } = await request.json();
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
        path: "/api/utils/update-password",
      },
      "Update password attempt started",
    );

    // update password user
    const response = await pool.query(
      `UPDATE users
       SET userpassword = $1
       WHERE userid = $2
       RETURNING *`,
      [newPassword, userID],
    );

    if (!response){
      logger.warn(
        {
          path: "/api/utils/update-password",
        },
        "Password update failed.",
      );

      endTimer({
        method: "PUT",
        route: "/api/utils/update-password",
        status_code: 400,
      });
      
      return NextResponse.json(
        { error: "Password could not be updated. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration    
    endTimer({
      method: "PUT",
      route: "/api/utils/update-password",
      status_code: 200,
    });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/update-password",
      },
      "Password successfully updated",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "PUT",
      route: "/api/utils/update-password",
      status_code: 500,
    });
    
    logger.error(
      {
        err,
        path: "/api/utils/update-password",
      },
      "Internal server error during password update",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
