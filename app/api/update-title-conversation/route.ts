"use server";

import { NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
import { cookies } from "next/headers";
import { JWTPayload } from "jose";
import { decrypt } from "@/app/lib/session";

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    // get cookie for user id
    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    const { id, newTitle } = await request.json();
    const pool = getPool();
    if (!userID)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // update title conversation
    const response = await pool.query(
      `UPDATE conversations
        SET title = $1, updatedat = $2
        WHERE convid = $3`,
      [newTitle, new Date(Date.now()), id],
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
