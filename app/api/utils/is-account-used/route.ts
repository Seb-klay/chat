import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { email } = await request.json();
    const pool = getPool();

    logger.info(
      {
        path: "/api/utils/is-account-used",
      },
      "Account usage check started",
    );

    // check if email is verified
    const response = await pool.query(
      `SELECT verified
      FROM email_verification_codes
      WHERE email = $1`,
      [email],
    );
    if (!response) {
      logger.warn(
        {
          path: "/api/utils/is-account-used",
        },
        "User lookup failed.",
      );
      endTimer({
        method: "GET",
        route: "/api/utils/is-account-used",
        status_code: 404,
      });

      return NextResponse.json(
        { error: "Message could not be stored. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({
      method: "GET",
      route: "/api/utils/is-account-used",
      status_code: 200,
    });

    logger.info(
      {
        path: "/api/utils/is-account-used",
      },
      "User successfully retrieved",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/is-account-used",
      status_code: 500,
    });
    
    logger.error(
      {
        err,
        path: "/api/utils/is-account-used",
      },
      "Internal server error during account usage check",
    );
    
    return NextResponse.json(err, { status: 500 });
  }
}
