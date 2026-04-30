import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const sessionUser = await verifySession();
    const pool = getPool();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 404 },
      );

    logger.info(
      {
        path: "/api/files/get-files-metadata",
      },
      "File metadata retrieval attempt started",
    );

    // get files metadata in main DB
    const response = await pool.query(
      `SELECT
          fileid, name, type, size, path, createdat, updatedat, isdirectory, messid
        FROM Files
        WHERE userID = $1
        AND (isDeleted = false)`,
      [userID],
    );
    if (!response){
      endTimer({
        method: "GET",
        route: "/api/files/get-files-metadata",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/files/get-files-metadata",
        },
        "File metadata retrieval failed: Files not found",
      );

      return NextResponse.json(
        { error: "Files could not be loaded. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/files/get-files-metadata", status_code: 200 });

    logger.info(
      {
        path: "/api/files/get-files-metadata",
      },
      "File metadata retrieved successfully",
    );

    return NextResponse.json({ files: response.rows }, { status: 200 });
  } catch (err: any) {
    endTimer({
      method: "GET",
      route: "/api/files/get-files-metadata",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/files/get-files-metadata",
      },
      "Internal server error during file metadata retrieval",
    );

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}