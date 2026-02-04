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
    const sessionUser = "019c297a-d495-7959-9115-3d6fd0acc02b"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // get list of conversations
    const response = await pool.query(
      `SELECT convid, title, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND isdeleted = false
       ORDER BY createdat DESC`,
      [sessionUser],
    );
    if (!response)
      return NextResponse.json(
        { error: "Conversations could not be loaded. " },
        { status: 400 },
      );

    return NextResponse.json({ conversations: response.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
