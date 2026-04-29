import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import { getStorageToken } from "@/app/backend/file-database/storageUtils";
import { NextRequest, NextResponse } from "next/server";
import { logger, httpRequestDuration } from "@/app/utils/logger";
const PUBLIC_URL = process.env.OBJECT_STORAGE_URL!;
const container = process.env.OBJECT_STORAGE_CONTAINER;

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const endTimer = httpRequestDuration.startTimer();

  try {
    const { files } = await request.json();
    const token = await getStorageToken();

    const uploadPromises = files.map(async (file: preparedFiles) => {
      if (file.isdirectory) return;
      if (!file.id) return NextResponse.json({ error: "No file could be found. " }, { status: 404 });
      if (!file.data) return NextResponse.json({ error: "The file has no data to store. " }, { status: 400 });

      const fileBuffer = Buffer.from(file.data, "base64");

      logger.info(
        {
          path: "/api/utils/upload-files",
        },
        "File upload attempt started",
      );
      
      return await fetch(`${PUBLIC_URL}/${container}/${file.id}`, { // store object with name as id to avoid conflict
        method: "PUT",
        headers: {
          "X-Auth-Token": token,
          "Content-Type": file.type || (`application/${file.name.split('.').pop()}`),
        },
        body: fileBuffer,
      });
    });

    const results = await Promise.all(uploadPromises);
    if (!results){
      endTimer({
        method: "PUT",
        route: "/api/utils/upload-files",
        status_code: 404,
      });

      logger.warn(
        {
          path: "/api/utils/upload-files",
        },
        "File upload failed: File not found",
      );

      return NextResponse.json(
        { error: "File could not be stored. " },
        { status: 400 },
      );
    }

    // Stop the timer and record the duration
    endTimer({ method: "PUT", route: "/api/utils/upload-files", status_code: 200 });

    logger.info(
      {
        path: "/api/utils/upload-files",
      },
      "File uploaded successfully",
    );

    return NextResponse.json(
      { message: "File stored successfully. " },
      { status: 200 },
    );
  } catch (err) {
    endTimer({
      method: "PUT",
      route: "/api/utils/upload-files",
      status_code: 500,
    });

    logger.error(
      {
        err,
        path: "/api/utils/upload-files",
      },
      "Internal server error during file upload",
    );

    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}