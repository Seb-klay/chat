"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { title, defaultModel } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019c297a-d495-7959-9115-3d6fd0acc02b"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        {
          error:
            "No user could be found with these credentials. Try again please. ",
        },
        { status: 404 },
      );
    // Create conversation
    const response = await pool.query(
      `INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) 
        values ($1, $2, $3, $4, $5, $6) 
        RETURNING convid`,
      [
        title,
        sessionUser,
        new Date(Date.now()),
        new Date(Date.now()),
        defaultModel,
        false,
      ],
    );
    if (!response)
      return NextResponse.json(
        { error: "Could not create a new conversation. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
