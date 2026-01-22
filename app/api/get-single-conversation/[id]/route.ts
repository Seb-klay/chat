'use server'

import { NextResponse } from "next/server";
import { getPool } from "../../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function GET(
    request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    //const { userId } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = 1 // to delete after testing !

    const { id } = await params;

    if (!sessionUser){
        return NextResponse.json("No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.", { status: 404 });
    }

    const pool = getPool();

    const response = await pool.query(
      `SELECT convid, title, defaultModel, createdat, updatedat
       FROM conversations 
       WHERE userid = $1
       AND convid = $2
       AND isdeleted = false`,
      [sessionUser, id]
    );

    return NextResponse.json(response.rows, { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}