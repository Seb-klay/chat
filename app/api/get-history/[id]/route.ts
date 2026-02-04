"use server";

import { NextResponse } from "next/server";
import { getPool } from "../../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019c2842-3c28-7d06-b7a1-3539934859a7"; // to delete after testing !
    const { id } = params;
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // Get list of messages
    const response = await pool.query(
      `SELECT rolesender as role, model, textmessage as content
       FROM messages 
       WHERE convid = $1
       ORDER BY createdat ASC`,
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
