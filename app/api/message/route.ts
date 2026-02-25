import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import {
  closeClient,
  getClient,
} from "@/app/backend/database/utils/databaseUtils";
import { decrypt } from "@/app/lib/session";
import { IMessage } from "@/app/utils/chatUtils";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let client: Client | undefined;
  try {
    const { message, conversationId } = await request.json();
    const { role, model, content, files }: IMessage = message.at(-1);

    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

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

    let storedFiles: preparedFiles[] = [];
    if (files && files.length > 0) {
      const messageId = messagesResponse.rows[0].messid;

      for (const file of files) {
        const fileResponse = await client.query(
          `INSERT INTO files (name, type, size, path, createdAt, isDirectory, messid, userid) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [file.name, file.type, file.size, file.path || "/Documents", new Date(Date.now()), file.isdirectory || false, messageId, userID],
        );
        storedFiles.push(fileResponse.rows[0]);

        if (!fileResponse)
          return NextResponse.json(
            { error: "Files could not be stored. " },
            { status: 400 },
          );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({ storedFiles: storedFiles }, { status: 200 });
  } catch (err) {
    await client?.query("ROLLBACK");
    return NextResponse.json(err, { status: 500 });
  } finally {
    if (client) await closeClient();
  }
}
