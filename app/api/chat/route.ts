import { NextRequest, NextResponse } from "next/server";
//import { Answer } from '../../utils/conversation';

export async function POST(request: NextRequest):Promise<NextResponse<unknown>> {
  const messages = await request.json();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "tinyllama", // or "phi"
      prompt: 'hi' // messages.messages.map((m: any) => m.content).join("\n")
    }),
  });

  // TODO keep going here
  console.log(response)

  //const data = await response.json();
  //return NextResponse.json(data);
  return NextResponse.json('');
}
