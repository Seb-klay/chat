import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const sessionUser = await verifySession();
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
          fileid, name, type, size, path, createdat, updatedat, isdirectory, messid
        FROM Files
        WHERE userID = $1
        AND (isDeleted = false)`,
      [userID],
    );
    if (!response)
      return NextResponse.json(
        { error: "Files could not be loaded. " },
        { status: 400 },
      );

    return NextResponse.json({ files: response.rows }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}