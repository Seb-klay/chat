"use server";

import { preparedFiles } from "../(main)/conversation/[id]/page";
import * as PdfParse from 'pdf-parse-new';
import { AnonymizeNlp } from 'anonymize-nlp';

export interface IExtractResult {
  text: preparedFiles[] | null;
  images: string[] | null;
  error: string | null ;
}

export async function extractTextFromFiles(files: preparedFiles[]) {
  const parser = new PdfParse.SmartPDFParser();
  
  const result: IExtractResult = {
    text: null,
    images: null,
    error: null,
  };
  if (!files)
    return result;
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
  try {
    const textResults: preparedFiles[] = [];
    const images: string[] = [];

    for (const file of files) {
      // Check if it's a PDF file
      if (!file.data)
        return result;
      const fileText = await file.data;
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        // Convert base64 back to buffer
        const pdfBuffer = Buffer.from(fileText, "base64");

        const pdfResult = await parser.parse(pdfBuffer);
        if (!pdfResult)
          return result
        const text = pdfResult.text

        // data anonymization
        const anonymizer = new AnonymizeNlp();
        const anonymizedText = anonymizer.anonymize(text);

        const newFile: preparedFiles = {
          ...file,
          data: anonymizedText
        }
        textResults.push(newFile);
      }
      //Handle text files
      else if (file.type && file.type.startsWith("text/") || file.name.endsWith(".txt")) {
        const text = Buffer.from(fileText, "base64").toString("utf-8");

        // data anonymization
        const anonymizer = new AnonymizeNlp();
        const anonymizedText = anonymizer.anonymize(text);

        textResults.push({
          ...file,
          data: anonymizedText,
        });
      }
      // Handle images
      else if (file.type && file.type.startsWith("image/")) {
        //images.push(file.);
      }
    }

    return {
      ...result,
      text: textResults,
      images: images.length > 0 ? images : null,
      error: null,
    };
  } catch (error) {
    return {
      ...result,
      text: null,
      images: null,
      error: error instanceof Error ? error.message : "Error while parsing files.",
    };
  }
}
