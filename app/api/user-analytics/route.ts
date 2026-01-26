import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { IAnswer } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";

// Create new user
export async function POST(request: NextRequest): Promise<NextResponse> {
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

  console.log(analytics);

    // get user id in cookie
    // const session = (await cookies()).get("session")?.value;
    // const sessionUser: JWTPayload | undefined = await decrypt(session);
    const sessionUser = '019bf62e-12bb-716a-b66e-6c78c3e52dd6'  // to delete after testing !

  const pool = getPool();

  try {
    const response = await pool.query(
      `INSERT INTO users_analytics 
      (userid, created_at, total_duration, load_duration, prompt_eval_count, prompt_eval_duration, eval_count, eval_duration, defaultmodel) 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [sessionUser, created_at, total_duration, load_duration, prompt_eval_count, prompt_eval_duration, eval_count, eval_duration, model],
    );

    console.log(response);


    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.log(err)
    return NextResponse.json(err, { status: 500 });
  }
}
