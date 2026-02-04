"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019c297a-d495-7959-9115-3d6fd0acc02b"; // to delete after testing !
    const pool = getPool();
    if (!sessionUser)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );
    // get analytics of one user of the last 7 days
    const response = await pool.query(
      `SELECT
          DATE(created_at) AS day,
          defaultModel AS model,
          COUNT(*) AS requests,
          SUM(total_duration) AS total_duration,
          SUM(load_duration) AS load_duration,
          SUM(prompt_eval_count) AS prompt_eval_count,
          SUM(prompt_eval_duration) AS prompt_eval_duration,
          SUM(eval_count) AS eval_count,
          SUM(eval_duration) AS eval_duration
        FROM Users_analytics
        WHERE userID = $1
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY day, defaultModel
        ORDER BY day ASC, defaultModel;`,
      [sessionUser],
    );
    if (!response)
      return NextResponse.json(
        { error: "Analytics could not be loaded. " },
        { status: 400 },
      );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
