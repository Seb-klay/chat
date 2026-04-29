import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getStorageToken } from "@/app/backend/file-database/storageUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";
const PUBLIC_URL = process.env.OBJECT_STORAGE_URL!;
const container = process.env.OBJECT_STORAGE_CONTAINER;

export async function POST(
  request: NextRequest,
){
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { filePath } = await request.json();
    
    if (!filePath) return NextResponse.json({ error: "No path given for the file. " }, { status: 404 });

    const token = await getStorageToken();

    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 404 },
      );
    const pool = getPool();

    logger.info(
      {
        userID,
        path: "/api/files/download-file-with-path",
      },
      "Download metadata attempt started",
    );

    // Get file metadata
    const response = await pool.query(
      `SELECT
          fileid, name, type, isdirectory
        FROM Files
        WHERE userID = $1
        AND path = $2`,
      [userID, filePath],
    );
    if (!response.rows[0]){
      endTimer({
        method: "POST",
        route: "/api/files/download-file-with-path",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/files/download-file-with-path",
        },
        "File lookup failed: File not found",
      );

      return NextResponse.json(
        { error: "File metadata could not be loaded. " },
        { status: 400 },
      );
    }

    if (response.rows[0].isdirectory) 
      return NextResponse.json(
        { error: "Cannot download a folder. " },
        { status: 400 },
      );

    const fileID = response.rows[0].fileid;
    const fileName = response.rows[0].name;
    const mimeType = response.rows[0].type;

    logger.info(
      {
        userID,
        path: "/api/files/download-file-with-path",
      },
      "Download file attempt started",
    );

    // Get file data from object storage
    const responseFile = await fetch(`${PUBLIC_URL}/${container}/${fileID}`, {
      method: "GET",
      headers: {
        "X-Auth-Token": token,
      },
    });

    if (!responseFile.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // file data
    const file = Buffer.from(await responseFile.arrayBuffer());

    // Convert ArrayBuffer to Blob
    const blob = new Blob([file], { type: mimeType });

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/files/download-file-with-path", status_code: 200 });

    logger.info(
      {
        userID,
        path: "/api/files/download-file-with-path",
      },
      "File successfully retrieved",
    );

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    endTimer({
      method: "POST",
      route: "/api/files/download-file-with-path",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/files/download-file-with-path",
      },
      "Internal server error during file download",
    );

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
