import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";

// Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, encrPassword }: IUser = await request.json();

  const pool = getPool();

  try {
    const response = await pool.query(
      "INSERT INTO users (email, userpassword) values ($1, $2) RETURNING userid, email, userrole",
      [email, encrPassword]
    );

    const newUser: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: encrPassword,
      role: response.rows[0].userrole
    };

    return NextResponse.json(newUser, { status : 200});
  } catch (err) {
    return NextResponse.json(err, { status: 500});
  }
}
