'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";

// Delete conversation
export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const pool = getPool();

    // Get the conversation ID from the URL query
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Mark the conversation as deleted
    const response = await pool.query(
      `UPDATE conversations
       SET isDeleted = true, updatedat = $1
       WHERE convid = $2
       RETURNING *`,
      [new Date(Date.now()), id]
    );

    if (response.rowCount === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(response.rows[0], { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
