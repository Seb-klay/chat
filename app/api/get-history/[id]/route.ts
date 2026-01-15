'use server'

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function GET(
  request: NextRequest,
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

    // call to AI to make summary (title) of conversation
    // const title = 'summary AI'

    const response = await pool.query(
      `SELECT rolesender, model, textmessage
       FROM messages 
       WHERE convid = $1`,
       //ORDER BY created_at ASC,
      [id]
    );

    return NextResponse.json(response.rows, { status: 200 });

  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}