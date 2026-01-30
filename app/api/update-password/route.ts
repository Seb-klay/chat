"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { newPassword } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019bf62e-12bb-716a-b66e-6c78c3e52dd6"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // update password user
    const response = await pool.query(
      `UPDATE users
       SET userpassword = $1
       WHERE userid = $2
       RETURNING *`,
      [newPassword, sessionUser],
    );
    if (!response)
      return NextResponse.json(
        { error: "Password could not be updated. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
