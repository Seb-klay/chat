'use server'

import {
  getPool,
} from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { IMessage } from "@/app/utils/chatUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { message, conversationId } = await request.json();
    const { role, model, content }: IMessage = message.at(-1);

    const pool = getPool();
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    if (!userID)
      return NextResponse.json(
        { error: "No user could be found with these credentials. " },
        { status: 400 },
      );

    logger.info(
      {
        path: "/api/chat/create-message",
      },
      "Message creation attempt started",
    );

    // create new message in conversation
    const messagesResponse = await pool.query(
      `INSERT INTO messages (rolesender, model, content, convid, createdat) 
      values ($1, $2, $3, $4, $5)
      RETURNING messid`,
      [role, model, content, conversationId, new Date(Date.now())],
    );
    if (messagesResponse.rowCount === 0){
      endTimer({
        method: "POST",
        route: "/api/chat/create-message",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/chat/create-message",
        },
        "Message creation failed: Message could not be stored",
      );

      return NextResponse.json(
        { error: "Message could not be stored. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "POST", route: "/api/chat/create-message", status_code: 200 });

    logger.info(
      {
        path: "/api/chat/create-message",
      },
      "Message created successfully.",
    );

    return NextResponse.json({ messID: messagesResponse.rows[0].messid }, { status: 200 });
  } catch (err) {
    endTimer({
      method: "POST",
      route: "/api/chat/create-message",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/chat/create-message",
      },
      "Internal server error during message creation",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
