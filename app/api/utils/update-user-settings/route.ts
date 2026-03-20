"use server";

import { NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";

export async function PUT(request: Request): Promise<NextResponse> {
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

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
