"use server";

import * as PdfParse from "pdf-parse-new";
import { AnonymizeNlp } from "anonymize-nlp";
import { preparedFile } from "./fileUtils";

export async function extractTextFromFiles(
  file: preparedFile,
): Promise<{ result: preparedFile; error: string }> {
  const parser = new PdfParse.SmartPDFParser();

  if (!file) throw new Error("No files found.");
  // Use Promise.all to wait for all files to convert in parallel
  //const filesBase64 = await Promise.all(files.map(toBase64));

  // while waiting for kreuzberg to work
  //const result = await batchExtractFiles(filesBase64);
  // const fileText = result.map(file => file.content);
  // const fileImages = result
  //   .flatMap(file => file.images || [])
  //   .map(img => {
  //     // img.data is a Uint8Array.
  //     // We wrap it in a Buffer to use the high-performance 'base64' encoder.
  //     return Buffer.from(img.data).toString('base64');
  //   });
  const images: string[] = [];
  try {
    // Check if it's a PDF file
    if (!file.data) throw new Error("No files found.");
    const fileText = file.data;
    let text: string = "";
    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      // Convert base64 back to buffer
      const pdfBuffer = Buffer.from(fileText, "base64");
      const pdfResult = await parser.parse(pdfBuffer);

      if (!pdfResult) throw new Error("No files found.");
      text = pdfResult.text;
    }
    //Handle text files
    else if (
      (file.type && file.type.startsWith("text/")) ||
      file.name.endsWith(".txt")
    ) {
      text = Buffer.from(fileText, "base64").toString("utf-8");
    }
    // Handle images
    else if (file.type && file.type.startsWith("image/")) {
      //images.push(file.);
    }
    // data anonymization
    const anonymizer = new AnonymizeNlp();
    const anonymizedText = anonymizer.anonymize(text);

    return { result: {...file, data: anonymizedText}, error: "" };
  } catch (error: any) {
    return {
      result: file,
      error: `${error}`,
    };
  }
}
