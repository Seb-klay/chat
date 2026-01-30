'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";

export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Get the conversation ID from the URL query
    const { id } = await request.json();
    const pool = getPool();
    if (!id) return NextResponse.json({ error: "Conversation ID is required. "}, { status: 404 });
    // Delete conversation
    const response = await pool.query(
      `UPDATE conversations
       SET isDeleted = true, updatedat = $1
       WHERE convid = $2
       RETURNING *`,
      [new Date(Date.now()), id]
    );
    if (response.rowCount === 0) return NextResponse.json({ error: "Conversation could not be found. "}, { status: 404 });

    return NextResponse.json(response.rows[0], { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
