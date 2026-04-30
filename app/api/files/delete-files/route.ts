import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "node-appwrite";
import { logger, httpRequestDuration } from "@/app/utils/logger";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function DELETE(request: NextRequest) {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { files } = await request.json();
    if (!files)
      return NextResponse.json(
        { error: "No file were given to delete. " },
        { status: 404 },
      );

    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    logger.info(
      {
        path: "/api/files/delete-files",
      },
      "Deletion attempt started",
    );

    const appWrite = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const pool = getPool();

    for (const file of files) {
      // get files metadata in main DB
      const responseMeta = await pool.query(
        `SELECT
            fileid, name, type, isdirectory
          FROM Files
          WHERE userID = $1
          AND path = $2
          AND name = $3`,
        [userID, file.path, file.name],
      );
      if (responseMeta.rowCount === 0)
        return NextResponse.json(
          { error: "File metadata could not be loaded. " },
          { status: 400 },
        );

      const fileID = responseMeta.rows[0].fileid;

      if (!responseMeta.rows[0].isdirectory) {
        const deletedFile = await storage.deleteFile({
          bucketId: BUCKET_ID,
          fileId: fileID,
        });
        if (!deletedFile)
          return NextResponse.json(
            { error: "File could not be deleted. " },
            { status: 404 },
          );
      }

      const response = await pool.query(
        `UPDATE Files
            SET isDeleted = TRUE,
            updatedat = $1
            WHERE userID = $2
            AND fileID = $3`,
        [new Date(Date.now()), userID, fileID],
      );
      if (!response){
      endTimer({
        method: "DELETE",
        route: "/api/files/delete-files",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/files/delete-files",
        },
        "File deletion failed.",
      );
        return NextResponse.json(
          { error: "Messages could not be loaded. " },
          { status: 400 },
        );
      }
    }

    // Stop the timer and record the duration
    endTimer({ method: "DELETE", route: "/api/files/delete-files", status_code: 200 });

    logger.info(
      {
        path: "/api/files/delete-files",
      },
      "Deletion attempt succeeded",
    );

    return NextResponse.json(
      { message: "Files deleted successfully. " },
      { status: 200 },
    );
  } catch (err: any) {
    endTimer({
      method: "DELETE",
      route: "/api/files/delete-files",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/files/delete-files",
      },
      "Internal server error during file deletion",
    );

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
