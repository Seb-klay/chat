import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";

// Update table "validate user"
export async function POST(request: NextRequest): Promise<NextResponse> {
  const objects = await request.json();
  const { email, code, expiresAt } = objects;
  const now = new Date(Date.now());

  const pool = getPool();

  try {
    const response = await pool.query(
      `INSERT INTO email_verification_codes (email, verified, code, expires_at, created_at) 
        VALUES ($1, $2, $3, $4, $5)`,
      [email, false, code, expiresAt, now.toISOString()]
    );

    return NextResponse.json({ status : 200});
  } catch (err) {
    console.error(err)
    return NextResponse.json(err, { status: 500});
  }
}