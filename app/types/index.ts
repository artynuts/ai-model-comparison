export type RatingCategory = {
  key: "accuracy" | "relevance" | "completeness" | "concise" | "unbiased";
  label: string;
  description: string;
};

export const RATING_CATEGORIES: RatingCategory[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    description: "Were there any factual errors?",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Did it fully answer the question?",
  },
  {
    key: "completeness",
    label: "Complete",
    description: "Was anything missing?",
  },
  {
    key: "concise",
    label: "Concise",
    description: "Was the response straight to the point?",
  },
  {
    key: "unbiased",
    label: "Unbiased",
    description: "Did you detect any bias in the response?",
  },
];

export type ResponseRating = {
  [K in RatingCategory["key"]]: boolean | null;
};

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
  timestamp: number;
}
