import {
  closeClient,
  getClient,
  getPool,
} from "@/app/backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let client: Client | undefined;
  try {
    const { message, conversationId } = await request.json();
    const { role, model, content, files }: IMessage = message.at(-1);
    //const pool = getPool();
    client = await getClient();
    // create new message in conversation
    await client.query("BEGIN");
    const messagesResponse = await client.query(
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

    if (files && files.length > 0) {
      const messageId = messagesResponse.rows[0].messid;

      for (const file of files) {
        const fileResponse = await client.query(
          `INSERT INTO files (name, type, size, messid) 
          VALUES ($1, $2, $3, $4)`,
          [file.name, file.type, file.size, messageId],
        );

        if (!fileResponse)
          return NextResponse.json(
            { error: "Files could not be stored. " },
            { status: 400 },
          );
        }
      }

    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Message stored successfully. " },
      { status: 200 },
    );
  } catch (err) {
    await client?.query("ROLLBACK");
    return NextResponse.json(err, { status: 500 });
  } finally {
    if (client) await closeClient();
  }
}
