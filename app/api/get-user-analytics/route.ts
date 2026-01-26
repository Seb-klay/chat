"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
// import { cookies } from "next/headers";
// import { JWTPayload } from "jose";
// import { decrypt } from "@/app/lib/session";

// Create conversation
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    //const { userId } = await request.json();
    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = "019bf62e-12bb-716a-b66e-6c78c3e52dd6"; // to delete after testing !

    if (!sessionUser) {
      throw new Error(
        "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation."
      );
    }

    const pool = getPool();

    const response = await pool.query(
      `
        SELECT
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
        ORDER BY day ASC, defaultModel;
        `,
      [sessionUser],
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
