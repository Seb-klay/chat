import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";

// Get existing user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email }: IUser = await request.json();

  const pool = getPool();

  try {
    const response = await pool.query(
      "SELECT userid, userpassword, userrole FROM users WHERE email = $1",
      [email]
    );

    if (!response) throw new Error("The user could not be found. Try again please.");

    const user: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: response.rows[0].userpassword,
      role: response.rows[0].role,
    };

    // update the answer !
    return NextResponse.json( user, { status: 200 });
  } catch (err) {
    return NextResponse.json( err, { status: 500 });
  }
}
