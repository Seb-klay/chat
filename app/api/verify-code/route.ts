import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";

// Update table "email_verification_codes"
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const objects = await request.json();
    const { email, code } = objects;
    const pool = getPool();
    // get user verification code
    const response = await pool.query(
      `SELECT 1
        FROM email_verification_codes
        WHERE email = $1
            AND code = $2
            AND expires_at > NOW()
            AND verified = false`,
      [email, code]
    );
    if (response.rowCount === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }
    //Mark as verified
    const update = await pool.query(
      `UPDATE email_verification_codes
        SET verified = true
        WHERE email = $1 AND code = $2 AND verified = false
        RETURNING *`,
      [email, code]
    );
    if (update.rowCount === 0) {
      return NextResponse.json(
        { error: "Code already used or invalid" },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
