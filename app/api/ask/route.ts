import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.PALM_API_KEY!);

async function askGPT4(query: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: query }],
  });
  return completion.choices[0].message.content || "";
}

async function askClaude(query: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [{ role: "user", content: query }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function askPaLM(query: string) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(query);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get response from Gemini"
    );
  }
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
      {
        error:
          error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
