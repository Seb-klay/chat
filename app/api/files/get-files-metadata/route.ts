import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { decrypt } from "@/app/lib/session";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
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