export interface AIResponse {
  modelName: string;
  response: string;
  latency: number;
  error?: string;
}

export interface ComparisonState {
  isLoading: boolean;
  responses: AIResponse[];
}
