import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

// Create message in conversation
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message, conversationId } = await request.json();
    const { role, model, prompt }: IMessage = message.at(-1);

    const pool = getPool();

    pool.query(
      `INSERT INTO messages (rolesender, model, textmessage, convid, createdat) 
      values ($1, $2, $3, $4, $5)`,
      [role, model, prompt, conversationId, new Date(Date.now())]
    );

    return NextResponse.json({ status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
