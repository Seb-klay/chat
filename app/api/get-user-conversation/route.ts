'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    //const { userId } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = '019bf62e-12bb-716a-b66e-6c78c3e52dd6'  // to delete after testing !

    if (!sessionUser){
        return NextResponse.json("No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.", { status: 404 });
    }

    const pool = getPool();

    const response = await pool.query(
      `SELECT convid, title, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND isdeleted = false
       ORDER BY createdat DESC`,
      [sessionUser]
    );

    return NextResponse.json({ conversations: response.rows }, { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}