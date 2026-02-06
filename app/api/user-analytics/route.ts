import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IAnswer } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTPayload } from "jose";
import { decrypt } from "@/app/lib/session";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // get user id in cookie
    const session = (await cookies()).get("session")?.value;
    const sessionUser: JWTPayload | undefined = await decrypt(session);
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        {
          error:
            "User could not be found with these credentials. Try again please. ",
        },
        { status: 404 },
      );

    const pool = getPool();
    const analytics = (await request.json()) as IAnswer;
    const {
      model,
      created_at,
      total_duration,
      load_duration,
      prompt_eval_count,
      prompt_eval_duration,
      eval_count,
      eval_duration,
    } = analytics;
    // update user analytics
    const response = await pool.query(
      `INSERT INTO users_analytics 
      (userid, created_at, total_duration, load_duration, prompt_eval_count, prompt_eval_duration, eval_count, eval_duration, defaultmodel) 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userID,
        created_at,
        total_duration,
        load_duration,
        prompt_eval_count,
        prompt_eval_duration,
        eval_count,
        eval_duration,
        model,
      ],
    );
    if (!response)
      return NextResponse.json({ error: "Analytics could not be updated. " });

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
