"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
import { cookies } from "next/headers";
import { JWTPayload } from "jose";
import { decrypt } from "@/app/lib/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // get cookie for user id
    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
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
    // get user settings
    const response = await pool.query(
      `SELECT
          colortheme, defaultmodel
        FROM users_settings
        WHERE userid = $1`,
      [userID],
    );
    if (!response)
      return NextResponse.json(
        { error: "The user settings could not be loaded." },
        { status: 400 },
      );

    return NextResponse.json(
      {
        colortheme: response.rows[0].colortheme,
        defaultmodel: response.rows[0].defaultmodel,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
