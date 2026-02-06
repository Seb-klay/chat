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
          error: "No user has been found with these credentials.",
        },
        { status: 404 },
      );
    // get email
    const response = await pool.query(
      `SELECT
          email
      FROM users
      WHERE userid = $1`,
      [userID],
    );
    if (!response)
      return NextResponse.json(
        { error: "The user could not be found." },
        { status: 404 },
      );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
