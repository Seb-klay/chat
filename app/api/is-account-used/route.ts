import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();
    const pool = getPool();
    // check if email is verified
    const response = await pool.query(
      `SELECT verified
      FROM email_verification_codes
      WHERE email = $1`,
      [ email ],
    );
    if (!response)
      return NextResponse.json(
        { error: "Message could not be stored. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows , { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
