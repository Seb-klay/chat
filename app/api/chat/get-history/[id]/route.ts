"use server";

import { NextResponse } from "next/server";
import { getPool } from "@/app/backend/database/utils/databaseUtils";
import { verifySession } from "@/app/lib/session";
import { logger, httpRequestDuration } from "@/app/utils/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    // get cookie for user id
    const sessionUser = await verifySession();
    const userID = sessionUser?.userId;
    const { id } = await params;
    const pool = getPool();
    if (!userID)
      return NextResponse.json(
        {
          error:
            "No user has been found with these credentials. Try to login again or you are not allowed to see this conversation.",
        },
        { status: 404 },
      );

    logger.info(
      {
        path: "/api/chat/get-history/[id]",
      },
      "History retrieval started",
    );

    // Get list of messages
    const response = await pool.query(
      `SELECT 
        m.rolesender as role, 
        m.model as model, 
        m.content as content,
        m.createdat as createdat,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.fileid,
              'messid', f.messid,
              'name', f.name,
              'type', f.type,
              'size', f.size,
              'isdeleted', f.isdeleted
            )
          ) FILTER (WHERE f.messid IS NOT NULL),
          '[]'::json
        ) as files
      FROM messages m 
      LEFT JOIN files f ON m.messid = f.messid
      WHERE m.convid = $1
      GROUP BY m.messid, m.rolesender, m.model, m.content, m.createdat
      ORDER BY m.createdat ASC`,
      [id],
    );
    if (!response) {
      endTimer({
        method: "GET",
        route: "/api/chat/get-history/[id]",
        status_code: 400,
      });

      logger.warn(
        {
          path: "/api/chat/get-history/[id]",
        },
        "Message lookup failed: Conversation not found",
      );

      return NextResponse.json(
        { error: "Messages could not be loaded. " },
        { status: 400 },
      );
    }
    
    // Stop the timer and record the duration
    endTimer({ method: "GET", route: "/api/chat/get-history/[id]", status_code: 200 });

    logger.info(
      {
        path: "/api/chat/get-history/[id]",
      },
      "History retrieved successfully.",
    );

    return NextResponse.json(response.rows, { status: 200 });
  } catch (err) {
    endTimer({
      method: "GET",
      route: "/api/chat/get-history/[id]",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/chat/get-history/[id]",
      },
      "Internal server error during history retrieval",
    );

    return NextResponse.json(err, { status: 500 });
  }
}
