import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function askGPT4(query: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: query }],
  });
  return completion.choices[0].message.content;
}

async function askClaude(query: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [{ role: "user", content: query }],
  });
  return message.content[0].text;
}

async function askPaLM(query: string) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PALM_API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: Request) {
  try {
    const { model, query } = await request.json();

    let response: string;
    switch (model) {
      case "GPT-4":
        response = await askGPT4(query);
        break;
      case "Claude":
        response = await askClaude(query);
        break;
      case "PaLM":
        response = await askPaLM(query);
        break;
      default:
        return NextResponse.json(
          { error: "Model not supported" },
          { status: 400 }
        );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
