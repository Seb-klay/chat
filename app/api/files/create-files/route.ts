import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { files, messID } = await request.json();

    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    const pool = getPool();

    logger.info(
      {
        path: "/api/files/create-files",
      },
      "File creation attempt started",
    );

    let filesID: string[] = [];
    for (const file of files) {
      // get files metadata in main DB
      const responseMeta = await pool.query(
        `WITH base AS (
            SELECT $1::text AS original_name, $4::text AS original_path
        ),
        -- Find max suffix for names (used when path is '/')
        max_name_suffix AS (
            SELECT COALESCE(
                MAX(NULLIF(regexp_replace(name, '^' || (SELECT original_name FROM base), ''), '')::int),
                0
            ) AS max_num_name
            FROM files
            WHERE userid = $8 AND path = '/' AND name ~ ('^' || (SELECT original_name FROM base) || '[0-9]*$')
        ),
        -- Find max suffix for paths (used when path is not '/')
        max_path_suffix AS (
            SELECT COALESCE(
                MAX(NULLIF(regexp_replace(path, '^' || (SELECT original_path FROM base) || '_', ''), '')::int),
                0
            ) AS max_num_path
            FROM files
            WHERE userid = $8 AND path ~ ('^' || (SELECT original_path FROM base) || '_[0-9]+$')
        )
        INSERT INTO files (name, type, size, path, createdAt, isDirectory, messid, userid)
        SELECT 
            CASE 
                WHEN (SELECT original_path FROM base) = '/' AND EXISTS (SELECT 1 FROM files WHERE userid = $8 AND name = (SELECT original_name FROM base) AND path = '/')
                THEN (SELECT original_name FROM base) || (SELECT max_num_name + 1 FROM max_name_suffix)
                ELSE (SELECT original_name FROM base)
            END,
            $2, $3,
            CASE 
                WHEN (SELECT original_path FROM base) = '/' THEN '/'
                WHEN EXISTS (SELECT 1 FROM files WHERE userid = $8 AND name = (SELECT original_name FROM base) AND path = (SELECT original_path FROM base))
                THEN (SELECT original_path FROM base) || '_' || (SELECT max_num_path + 1 FROM max_path_suffix)
                ELSE (SELECT original_path FROM base)
            END,
            $5, $6, $7, $8
        RETURNING *;`,
        [
          file.name,
          file.type,
          file.size,
          file.path,
          new Date(Date.now()),
          file.isdirectory || false,
          messID,
          userID,
        ],
      );
      if (!responseMeta){
        endTimer({
          method: "POST",
          route: "/api/files/create-files",
          status_code: 400,
        });

        logger.warn(
          {
            path: "/api/files/create-files",
          },
          "File metadata could not be stored.",
        );
        return NextResponse.json(
          { error: "File metadata could not be stored. " },
          { status: 400 },
        );
      }
      const fileID = responseMeta.rows[0].fileid || "";
      filesID.push(fileID);
    }

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/files/create-files", status_code: 200 });

    logger.info(
      {
        path: "/api/files/create-files",
      },
      "File metadata stored successfully.",
    );

    return NextResponse.json({ storedFiles: filesID }, { status: 200 });
  } catch (err: any) {
    endTimer({
      method: "POST",
      route: "/api/files/create-files",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/files/create-files",
      },
      "Internal server error during file creation",
    );

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
