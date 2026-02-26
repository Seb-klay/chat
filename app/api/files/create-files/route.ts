import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { decrypt } from "@/app/lib/session";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Client, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { files } = await request.json();

    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    const appWrite: Client | undefined = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const pool = getPool();

    let response: string[] = [];
    for (const file of files) {
      // get files metadata in main DB
      const responseMeta = await pool.query(
        `INSERT INTO files (name, type, size, path, createdAt, isDirectory, userid)
            WITH base AS (
                SELECT $1::text AS base_name
            ),
            existing AS (
                SELECT name
                FROM files
                WHERE userid = $7
                AND path = $4
                AND name ~ ('^' || (SELECT base_name FROM base) || '[0-9]*$')
            ),
            max_suffix AS (
                SELECT COALESCE(
                    MAX(
                        NULLIF(
                            regexp_replace(name, '^[^0-9]*', ''),
                            ''
                        )::int
                    ),
                    0
                ) AS max_num
                FROM existing
            )
            SELECT
                CASE 
                    WHEN EXISTS (
                        SELECT 1
                        FROM files
                        WHERE userid = $7
                        AND path = $4
                        AND name = (SELECT base_name FROM base)
                    )
                    THEN (SELECT base_name FROM base) || (SELECT max_num + 1 FROM max_suffix)
                    ELSE (SELECT base_name FROM base)
                END,
                $2, $3, $4, $5, $6, $7
            RETURNING *;`,
        [
          file.name,
          file.type,
          file.size,
          file.path,
          new Date(Date.now()),
          file.isdirectory || false,
          userID,
        ],
      );
      if (!responseMeta)
        return NextResponse.json(
          { error: "File metadata could not be stored. " },
          { status: 400 },
        );
      const fileID = responseMeta.rows[0].fileid || '';
      response.push(fileID);
    }

    return NextResponse.json({ storedFiles : response }, { status: 200 });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
