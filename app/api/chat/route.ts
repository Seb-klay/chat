import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log(body)

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "tinyllama", // or "phi"
      prompt: '', // is overwritten by the front-end input
      stream: false,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
