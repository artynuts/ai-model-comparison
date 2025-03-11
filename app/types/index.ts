export interface AIResponse {
  modelName: string;
  provider: string;
  version: string;
  description: string;
  response: string;
  latency: number;
  error?: string;
}

export interface ComparisonState {
  isLoading: boolean;
  responses: AIResponse[];
}
