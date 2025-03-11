import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = {
  "GPT-4": {
    id: "GPT-4",
    name: "GPT-4",
    provider: "OpenAI",
    version: "gpt-4",
    description: "Most capable OpenAI model",
  },
  Claude: {
    id: "Claude",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    version: "claude-3-opus-20240229",
    description: "Latest Claude model",
  },
  Gemini: {
    id: "Gemini",
    name: "Gemini Flash",
    provider: "Google",
    version: "gemini-2.0-flash",
    description: "Quick response model",
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function askGPT4(query: string) {
  const completion = await openai.chat.completions.create({
    model: MODELS["GPT-4"].version,
    messages: [{ role: "user", content: query }],
  });
  return completion.choices[0].message.content || "";
}

async function askClaude(query: string) {
  const message = await anthropic.messages.create({
    model: MODELS["Claude"].version,
    max_tokens: 1024,
    messages: [{ role: "user", content: query }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function askGemini(query: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELS["Gemini"].version,
    });

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
    const modelInfo = MODELS[model as keyof typeof MODELS];

    if (!modelInfo) {
      return NextResponse.json(
        { error: "Model not supported" },
        { status: 400 }
      );
    }

    let response: string;
    switch (model) {
      case "GPT-4":
        response = await askGPT4(query);
        break;
      case "Claude":
        response = await askClaude(query);
        break;
      case "Gemini":
        response = await askGemini(query);
        break;
      default:
        return NextResponse.json(
          { error: "Model not supported" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      response,
      id: modelInfo.id,
      name: modelInfo.name,
      provider: modelInfo.provider,
      version: modelInfo.version,
      description: modelInfo.description,
    });
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
