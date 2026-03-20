'use server'

import {
  getPool,
} from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message, conversationId } = await request.json();
    const { role, model, content }: IMessage = message.at(-1);

    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    const pool = getPool();
    // create new message in conversation
    const messagesResponse = await pool.query(
      `INSERT INTO messages (rolesender, model, content, convid, createdat) 
      values ($1, $2, $3, $4, $5)
      RETURNING messid`,
      [role, model, content, conversationId, new Date(Date.now())],
    );
    if (messagesResponse.rowCount === 0)
      return NextResponse.json(
        { error: "Message could not be stored. " },
        { status: 400 },
      );

    return NextResponse.json({ messID: messagesResponse.rows[0].messid }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
