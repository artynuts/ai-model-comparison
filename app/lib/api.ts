import { AIResponse } from "../types";

const models = ["GPT-4", "Claude", "Gemini"];

export async function compareModels(query: string): Promise<AIResponse[]> {
  return Promise.all(
    models.map(async (model) => {
      const startTime = Date.now();
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, query }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `${model} request failed`);
        }

        const data = await response.json();
        return {
          modelName: data.name,
          id: data.id,
          provider: data.provider,
          version: data.version,
          description: data.description,
          response: data.response,
          latency: Date.now() - startTime,
        };
      } catch (error) {
        return {
          modelName: model,
          id: model,
          provider: "Unknown",
          version: "Unknown",
          description: "Error occurred",
          response: "",
          latency: Date.now() - startTime,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    })
  );
}
