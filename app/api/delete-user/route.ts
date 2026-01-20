'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Delete conversation
export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = 1 // to delete after testing !

    const pool = getPool();

    // Get the conversation ID from the URL query
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Mark the conversation as deleted
    const response = await pool.query(
      `UPDATE users
       SET isDeleted = true
       WHERE userid = $1
       RETURNING *`,
      [id]
    );

    if (response.rowCount === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(response.rows[0], { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
