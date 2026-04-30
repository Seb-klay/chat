import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IUser } from "@/app/utils/userUtils";
import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "@/app/utils/listModels";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { email, encrPassword }: IUser = await request.json();
    const pool = getPool();

    logger.info(
      {
        path: "/api/utils/create-user",
      },
      "User creation started",
    );

    // create new user and create user preferences
    const response = await pool.query(
      `WITH new_user AS (
        INSERT INTO users (email, userpassword)
        VALUES ($1, $2)
        RETURNING userid, email, userrole
      ),
      settings AS (
        INSERT INTO users_settings (userid, colortheme, defaultmodel)
        SELECT userid, $3, $4 FROM new_user
      )
      SELECT userid, userrole FROM new_user`,
      [email, encrPassword, "dark", MODELS[1]],
    );
    if (!response.rows[0].userid){
      logger.warn(
        {
          path: "/api/utils/create-user",
        },
        "User creation failed",
      );
      endTimer({ method: 'POST', route: '/api/utils/create-user', status_code: 400 });
      return NextResponse.json(
        { error: "Could not create new user. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: 'POST', route: '/api/utils/create-user', status_code: 200 });

    const newUser: IUser = {
      id: response.rows[0].userid,
      email: email,
      encrPassword: encrPassword,
      role: response.rows[0].userrole,
    };

    logger.info(
      {
        userId: newUser.id,
        role: newUser.role,
        path: "/api/utils/create-user",
      },
      "User successfully created",
    );

    return NextResponse.json(newUser, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/utils/create-user",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/create-user",
      },
      "Internal server error during user creation",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
