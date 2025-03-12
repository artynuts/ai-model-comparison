export interface ResponseRating {
  accuracy: boolean | null;
  relevance: boolean | null;
  completeness: boolean | null;
}

export interface AIResponse {
  modelName: string;
  id: string;
  provider: string;
  version: string;
  description: string;
  response: string;
  latency: number;
  error?: string;
  rating?: ResponseRating;
}

export interface ComparisonState {
  isLoading: boolean;
  responses: AIResponse[];
}
