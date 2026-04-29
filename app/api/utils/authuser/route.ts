import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { email }: IUser = await request.json();
    const pool = getPool();

    logger.info(
      {
        path: "/api/utils/authuser",
      },
      "Authentication attempt started",
    );

    // Get existing user
    const response = await pool.query(
      "SELECT userid, userpassword, userrole FROM users WHERE email = $1",
      [email],
    );

    if (!response || response.rowCount === 0) {
      endTimer({
        method: "POST",
        route: "/api/utils/authuser",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/utils/authuser",
        },
        "User lookup failed: Email not found",
      );

      return NextResponse.json(
        { error: "The user could not be found. Try again please." },
        { status: 404 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/utils/authuser", status_code: 200 });

    const user: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: response.rows[0].userpassword,
      role: response.rows[0].role,
    };

    logger.info(
      {
        userId: user.id,
        role: user.role,
        path: "/api/utils/authuser",
      },
      "User successfully retrieved",
    );

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/authuser",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/authuser",
      },
      "Internal server error during user authentication",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
