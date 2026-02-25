import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { decrypt } from "@/app/lib/session";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "node-appwrite";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function DELETE(
  request: NextRequest,
) {
  try {
    const { filesPath } = await request.json();
    if (!filesPath)
      return NextResponse.json(
        { error: "No file were given to delete. " },
        { status: 404 },
      );

    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    const appWrite = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const pool = getPool();

    for (const path of filesPath) {
      // get files metadata in main DB
      const responseMeta = await pool.query(
        `SELECT
            fileid, name, type
          FROM Files
          WHERE userID = $1
          AND path = $2`,
        [userID, path],
      );
      if (!responseMeta)
        return NextResponse.json(
          { error: "File metadata could not be loaded. " },
          { status: 400 },
        );

      const fileID = responseMeta.rows[0].fileid;

      const deletedFile = await storage.deleteFile({
        bucketId: BUCKET_ID,
        fileId: fileID,
      });
      if (!deletedFile)
        return NextResponse.json(
          { error: "File could not be deleted. " },
          { status: 404 },
        );

      const response = await pool.query(
        `UPDATE Files
            SET isDeleted = TRUE
            WHERE userID = $1
            AND fileID = $2`,
        [userID, fileID],
      );
      if (!response)
        return NextResponse.json(
          { error: "Messages could not be loaded. " },
          { status: 400 },
        );
    }

    return NextResponse.json(
      { message: "Files deleted successfully. " },
      { status: 200 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
