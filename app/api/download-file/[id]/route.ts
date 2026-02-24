import { getAppwriteClient } from "@/app/backend/file-database/appwriteUtils";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "node-appwrite";
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
){
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "No file could be found. " }, { status: 404 });

    const appWrite = await getAppwriteClient();
    const storage = new Storage(appWrite);

    const fileMeta = await storage.getFile({
      bucketId: BUCKET_ID,
      fileId: id,
    });

    // Optional: You can use metadata to set correct MIME type and filename
    const fileName = fileMeta.name;
    const mimeType = fileMeta.mimeType;

    const file = await storage.getFileDownload({
      bucketId: BUCKET_ID,
      fileId: id,
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Convert ArrayBuffer to Blob
    const blob = new Blob([file], { type: mimeType });
    const bytes = await blob.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
