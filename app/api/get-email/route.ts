'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = '019bf62e-12bb-716a-b66e-6c78c3e52dd6' // to delete after testing !

    if (!sessionUser){
        return NextResponse.json("No user has been found with these credentials.", { status: 404 });
    }

    const pool = getPool();

    const response = await pool.query(
        `
        SELECT
            email
        FROM users
        WHERE userid = $1
        `,
      [sessionUser]
    );

    if (!response) throw new Error("The user could not be found.");

    return NextResponse.json( response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}