import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";

// Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, encrPassword }: IUser = await request.json();

  const pool = getPool();

  const newUser: IUser = {
    email: email,
    encrPassword: encrPassword,
  };

  pool.query(
    "INSERT INTO users (email, userpassword) values ($1, $2)",
    [email, encrPassword],
    (err, res) => {
      if (err) {
        console.log("Error during user creation" + err, res);
      }
      (newUser.id = res.rows[0].id), (newUser.role = res.rows[0].role);
    }
  );

  return new NextResponse(JSON.stringify(newUser), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}