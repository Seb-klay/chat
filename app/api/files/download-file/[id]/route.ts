import { getStorageToken } from "@/app/backend/file-database/storageUtils";
import { NextRequest, NextResponse } from "next/server";
const PUBLIC_URL = process.env.OBJECT_STORAGE_URL!;
const container = process.env.OBJECT_STORAGE_CONTAINER;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
){
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "No file could be found. " }, { status: 404 });

    const token = await getStorageToken();

    // const appWrite = await getAppwriteClient();
    // const storage = new Storage(appWrite);

    // const fileMeta = await storage.getFile({
    //   bucketId: BUCKET_ID,
    //   fileId: id,
    // });

    // use metadata to set correct MIME type and filename
    // const fileName = fileMeta.name;
    // const mimeType = fileMeta.mimeType;

    // const file = await storage.getFileDownload({
    //   bucketId: BUCKET_ID,
    //   fileId: id,
    // });

    const responseFile = await fetch(`${PUBLIC_URL}/${container}/${id}`, { // store object with name as id to avoid conflict
      method: "GET",
      headers: {
        "X-Auth-Token": token,
      },
    });

    if (!responseFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileName = responseFile.headers.get("x-object-meta-orig-filename") || "file";
    const contentType = responseFile.headers.get("content-type") || "application/octet-stream";

    // file data
    const file = Buffer.from(await responseFile.arrayBuffer());

    // Convert ArrayBuffer to Blob
    const blob = new Blob([file], { type: contentType });
    const bytes = await blob.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
