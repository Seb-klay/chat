"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const pool = getPool();
    if (!userID)
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
      [userID],
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
