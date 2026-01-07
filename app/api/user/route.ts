import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";

// Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, encrPassword }: IUser = await request.json();

  const pool = getPool();

  try {
    const response = await pool.query(
      "INSERT INTO users (email, userpassword) values ($1, $2)",
      [email, encrPassword]
    );

    const newUser: IUser = {
      id: response.rows[0].id,
      email: email,
      encrPassword: encrPassword,
      role: response.rows[0].role
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
