import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "@/app/utils/listModels";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, encrPassword }: IUser = await request.json();

  const pool = getPool();

  try {
    // create new user
    const response = await pool.query(
      `INSERT INTO users (email, userpassword) values ($1, $2) 
      RETURNING userid, email, userrole`,
      [email, encrPassword]
    );
    if (!response) throw new Error("Could not create new user. ");

    const newUser: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: encrPassword,
      role: response.rows[0].userrole
    };

    // create user preferences
    const responsePreferences = await pool.query(
      `INSERT INTO users_settings (userid, colortheme, defaultmodel)
      values ($1, $2, $3)`,
      [newUser.id, "dark", MODELS[1]]
    );
    if (!responsePreferences) throw new Error("Could not create user preferences. ");

    return NextResponse.json(newUser, { status : 200});
  } catch (err) {
    return NextResponse.json(err, { status: 500});
  }
}
