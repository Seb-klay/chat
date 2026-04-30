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
    const { newTheme, newModel } = await request.json();
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
        path: "/api/utils/update-user-settings",
      },
      "Update user settings attempt started",
    );
    
    // update user settings, one or the other is null
    const response = await pool.query(
      `UPDATE users_settings
        SET 
            colortheme = COALESCE($1, colortheme), 
            defaultmodel = COALESCE($2, defaultmodel)
        WHERE userid = $3`,
      [newTheme, newModel, userID],
    );
    if (!response)
      return NextResponse.json(
        { error: "User settings could not be updated. " },
        { status: 400 },
      );

    // Stop the timer and record the duration    
    endTimer({
      method: "PUT",
      route: "/api/utils/update-user-settings",
      status_code: 200,
    });

    logger.info(
      {
        userId: userID,
        path: "/api/utils/update-user-settings",
      },
      "User settings successfully updated",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "PUT",
      route: "/api/utils/update-user-settings",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/update-user-settings",
      },
      "Internal server error during user settings update",
    );
    
    return NextResponse.json(err, { status: 500 });
  }
}
