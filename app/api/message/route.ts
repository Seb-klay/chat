import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message, conversationId } = await request.json();
    const { role, model, content }: IMessage = message.at(-1);
    const pool = getPool();
    // create new message in conversation
    const response = await pool.query(
      `INSERT INTO messages (rolesender, model, textmessage, convid, createdat) 
      values ($1, $2, $3, $4, $5)`,
      [role, model, content, conversationId, new Date(Date.now())],
    );
    if (!response)
      return NextResponse.json(
        { error: "Message could not be stored. " },
        { status: 400 },
      );

    return NextResponse.json({ message: "Message stored successfully. " }, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
