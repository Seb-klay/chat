import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "@/app/utils/listModels";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, encrPassword }: IUser = await request.json();
    const pool = getPool();
    // create new user and create user preferences
    const response = await pool.query(
      `WITH new_user AS (
        INSERT INTO users (email, userpassword) 
        VALUES ($1, $2) 
        RETURNING userid, email, userrole
      )
      INSERT INTO users_settings (userid, colortheme, defaultmodel)
      SELECT userid, $3, $4 FROM new_user`,
      [email, encrPassword, "dark", MODELS[1]],
    );
    if (!response)
      return NextResponse.json(
        { error: "Could not create new user. " },
        { status: 400 },
      );

    const newUser: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: encrPassword,
      role: response.rows[0].userrole,
    };
    return NextResponse.json(newUser, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
