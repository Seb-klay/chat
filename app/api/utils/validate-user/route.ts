import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

// Update table "validate user"
export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const objects = await request.json();
    const { email, code, expiresAt } = objects;
    const now = new Date(Date.now());
    const pool = getPool();

    logger.info(
      {
        path: "/api/utils/validate-user",
      },
      "Validation attempt started",
    );

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
    if (!response) {
      endTimer({
        method: "POST",
        route: "/api/utils/validate-user",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/utils/validate-user",
        },
        "User lookup failed: Email not found",
      );

      return NextResponse.json(
        { error: "Verification code could not be updated. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({
      method: "POST",
      route: "/api/utils/validate-user",
      status_code: 200,
    });

    logger.info(
      {
        path: "/api/utils/validate-user",
      },
      "User successfully retrieved",
    );

    return NextResponse.json(
      { message: "User validated successfully. " },
      { status: 200 },
    );
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/validate-user",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/validate-user",
      },
      "Internal server error during user validation",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
