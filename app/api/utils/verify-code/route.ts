import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

// Update table "email_verification_codes"
export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();
  try {
    const objects = await request.json();
    const { email, code } = objects;
    const pool = getPool();

    logger.info(
      {
        path: "/api/utils/verify-code",
      },
      "Verification attempt started",
    );

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
      endTimer({
        method: "POST",
        route: "/api/utils/verify-code",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/utils/verify-code",
        },
        "Code lookup failed.",
      );

      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }
    // Mark as verified
    const update = await pool.query(
      `UPDATE email_verification_codes
        SET verified = true
        WHERE email = $1 AND code = $2 AND verified = false
        RETURNING *`,
      [email, code]
    );
    if (update.rowCount === 0) {
      endTimer({
        method: "POST",
        route: "/api/utils/verify-code",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/utils/verify-code",
        },
        "Code already used or invalid.",
      );

      return NextResponse.json(
        { error: "Code already used or invalid" },
        { status: 400 }
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/utils/verify-code", status_code: 200 });

    logger.info(
      {
        path: "/api/utils/verify-code",
      },
      "Code verified successfully",
    );

    return NextResponse.json({ message: "Code verified successfully. " },{ status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/verify-code",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/verify-code",
      },
      "Internal server error during code verification",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
