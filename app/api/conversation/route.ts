'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { title, defaultModel } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = '019bf62e-12bb-716a-b66e-6c78c3e52dd6'  // to delete after testing !

    const pool = getPool();

    const response = await pool.query(
      `INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) 
        values ($1, $2, $3, $4, $5, $6) 
        RETURNING convid`,
      [ title, sessionUser, new Date(Date.now()), new Date(Date.now()), defaultModel, false]);

    return NextResponse.json(response.rows, { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}