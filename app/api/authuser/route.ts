import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";

// Get existing user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, encrPassword }: IUser = await request.json();

  const pool = getPool();

  try {
    const result = await pool.query(
      "SELECT userid, userpassword, userrole FROM users WHERE email = $1",
      [email]
    );

    const newUser: IUser = {
      id: result.rows[0].userid,
      email: email,
      encrPassword: result.rows[0].userpassword,
      role: result.rows[0].role,
    };

    return new NextResponse(JSON.stringify(newUser), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new NextResponse(JSON.stringify(err), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
