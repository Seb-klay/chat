import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { getStorageToken } from "@/app/backend/file-database/storageUtils";
import { verifySession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
const PUBLIC_URL = process.env.OBJECT_STORAGE_URL!;
const container = process.env.OBJECT_STORAGE_CONTAINER;

export async function POST(
  request: NextRequest,
){
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

    const response = await pool.query(
      `SELECT
          fileid, name, type, isdirectory
        FROM Files
        WHERE userID = $1
        AND path = $2`,
      [userID, filePath],
    );
    if (!response.rows[0])
      return NextResponse.json(
        { error: "File metadata could not be loaded. " },
        { status: 400 },
      );

    if (response.rows[0].isdirectory) 
      return NextResponse.json(
        { error: "Cannot download a folder. " },
        { status: 400 },
      );

    const fileID = response.rows[0].fileid;
    const fileName = response.rows[0].name;
    const mimeType = response.rows[0].type;

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

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
