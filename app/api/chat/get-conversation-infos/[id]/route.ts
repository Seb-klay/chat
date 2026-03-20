'use server'

import { NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const { id } = await params;
    const pool = getPool();
    if (!userID) return NextResponse.json({ error: "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation."}, { status: 404 });
    // Get conversation infos
    const response = await pool.query(
      `SELECT convid, title, defaultModel, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND convid = $2
       AND isdeleted = false`,
      [userID, id]
    );
    if (!response) return NextResponse.json({ error: "Conversation info could not be loaded. "}, { status: 400 });

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}