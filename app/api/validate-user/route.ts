import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";

// Update table "validate user"
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const objects = await request.json();
    const { email, code, expiresAt } = objects;
    const now = new Date(Date.now());
    const pool = getPool();
    // insert or update table with verification code (if verified = false)
    const response = await pool.query(
      `INSERT INTO email_verification_codes (email, verified, code, expires_at, created_at) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) 
        DO UPDATE SET 
          code = $3,
          expires_at = $4,
          created_at = $5
        WHERE email_verification_codes.verified = false`,
      [email, false, code, expiresAt, now.toISOString()],
    );
    if (!response)
      return NextResponse.json(
        { error: "Verification code could not be updated. " },
        { status: 400 },
      );

    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(err, { status: 500 });
  }
}
