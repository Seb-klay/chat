import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { decrypt } from "@/app/lib/session";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "node-appwrite";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function POST(
  request: NextRequest,
){
  try {
    const { filePath } = await request.json();
    
    if (!filePath) return NextResponse.json({ error: "No path given for the file. " }, { status: 404 });

    const appWrite = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 404 },
      );
    const pool = getPool();

    // get files metadata in main DB
    const response = await pool.query(
      `SELECT
          fileid, name, type
        FROM Files
        WHERE userID = $1
        AND path = $2`,
      [userID, filePath],
    );
    if (!response)
      return NextResponse.json(
        { error: "File metadata could not be loaded. " },
        { status: 400 },
      );

    const fileID = response.rows[0].fileid;
    const fileName = response.rows[0].name;
    const mimeType = response.rows[0].type;

    const file = await storage.getFileDownload({
      bucketId: BUCKET_ID,
      fileId: fileID,
    });

    if (!file) {
      return NextResponse.json({ error: "File not found in AW database. " }, { status: 404 });
    }

    // Convert ArrayBuffer to Blob
    const blob = new Blob([file], { type: mimeType });
    const bytes = await blob.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
