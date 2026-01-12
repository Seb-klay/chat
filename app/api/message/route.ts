import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

// Create message in conversation
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { message, conversationId } = await request.json();
    const { role, model, prompt }: IMessage = message;

    const pool = getPool();

    pool.query("INSERT INTO messages (rolesender, model, textmessage, convid) values ($1, $2, $3, $4)",
      [role, model, prompt, conversationId]);

    return NextResponse.json({ status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
