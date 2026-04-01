import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import { getStorageToken } from "@/app/backend/file-database/storageUtils";
import { NextRequest, NextResponse } from "next/server";
const PUBLIC_URL = process.env.OBJECT_STORAGE_URL!;
const container = process.env.OBJECT_STORAGE_CONTAINER;

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { files } = await request.json();
    const token = await getStorageToken();

    const uploadPromises = files.map(async (file: preparedFiles) => {
      if (file.isdirectory) return;
      if (!file.id) return NextResponse.json({ error: "No file could be found. " }, { status: 404 });
      if (!file.data) return NextResponse.json({ error: "The file has no data to store. " }, { status: 400 });

      const fileBuffer = Buffer.from(file.data, "base64");
      
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
    if (!results)
      return NextResponse.json(
        { error: "File could not be stored. " },
        { status: 400 },
      );

    return NextResponse.json(
      { message: "File stored successfully. " },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}