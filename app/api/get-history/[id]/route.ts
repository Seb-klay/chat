"use server";

import { NextResponse } from "next/server";
import { getPool } from "../../../backend/database/utils/databaseUtils";
import { cookies } from "next/headers";
import { JWTPayload } from "jose";
import { decrypt } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // get cookie for user id
    const cookie = (await cookies()).get("session");
    const sessionUser: JWTPayload | undefined = await decrypt(cookie?.value);
    const userID = sessionUser?.userId;
    const { id } = await params;
    const pool = getPool();
    if (!userID)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // Get list of messages
    const response = await pool.query(
      `SELECT 
        m.rolesender as role, 
        m.model as model, 
        m.content as content,
        m.createdat as createdat,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.fileid,
              'messid', f.messid,
              'name', f.name,
              'type', f.type,
              'size', f.size
            )
          ) FILTER (WHERE f.messid IS NOT NULL),
          '[]'::json
        ) as files
      FROM messages m 
      LEFT JOIN files f ON m.messid = f.messid
      WHERE m.convid = $1
      GROUP BY m.messid, m.rolesender, m.model, m.content, m.createdat
      ORDER BY m.createdat ASC`,
      [id],
    );
    if (!response)
      return NextResponse.json(
        { error: "Messages could not be loaded. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
