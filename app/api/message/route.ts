import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

// Create message in conversation
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const { role, model, prompt }: IMessage = await request.json();

  const pool = getPool()

  pool.query("INSERT INTO messages (rolesender, model, textmessage, convid) values ($1, $2, $3, $4)",
    [role, model, prompt, 1],
    (err, res) => {
    console.log('callback query finished' + err, res)
  })

  return new NextResponse(role, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
