"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019c297a-d496-7843-98cc-b9fac3fdd5a3"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
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
      [sessionUser],
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
