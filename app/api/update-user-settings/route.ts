"use server";

import { NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019bf62e-12bb-716a-b66e-6c78c3e52dd6"; // to delete after testing !
    const { newTheme, newModel } = await request.json();
    const pool = getPool();
    if (!sessionUser)
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
      [newTheme, newModel, sessionUser],
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
