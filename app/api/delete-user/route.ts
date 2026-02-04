"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the conversation ID from the URL query
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019c297a-d495-7959-9115-3d6fd0acc02b"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        { error: "Conversation ID is required. " },
        { status: 404 },
      );
    // Delete conversation
    const response = await pool.query(
      `UPDATE users
       SET isDeleted = true
       WHERE userid = $1
       RETURNING *`,
      [sessionUser],
    );
    if (response.rowCount === 0)
      return NextResponse.json(
        { error: "Conversation could not be found. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows[0], { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
