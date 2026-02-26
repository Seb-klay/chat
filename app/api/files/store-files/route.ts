import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { NextRequest, NextResponse } from "next/server";
import { Client, Storage } from "node-appwrite";
import { InputFile } from 'node-appwrite/file';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { files } = await request.json();

    const appWrite: Client | undefined = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const uploadPromises = files.map(async (file: preparedFiles) => {
      if (file.isdirectory) return;
      if (!file.id) return NextResponse.json({ error: "No file could be found. " }, { status: 404 });
      if (!file.data) return NextResponse.json({ error: "The file has no data to store. " }, { status: 400 });

      const fileBuffer = Buffer.from(file.data, "base64");
      
      return await storage.createFile(
        BUCKET_ID,
        file.id, // if no id, file not stored and api not triggered
        InputFile.fromBuffer(fileBuffer, file.name)
      );
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