import { apiRequest } from './api';

export type Assessment = {
  _id: string;
  user: string;
  confidenceGoal: string;
  speakingFrequency: string;
  practicePreference: string;
  baselineScores: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  };
  createdAt: string;
  updatedAt: string;
};

type StartResponse = {
  assessment: Assessment | null;
  status: string;
};

type SubmitResponse = {
  assessment: Assessment;
};

export function startAssessment(): Promise<StartResponse> {
  return apiRequest<StartResponse>('/assessment/start');
}

export function submitAssessment(
  confidenceGoal: string,
  speakingFrequency: string,
  practicePreference: string,
): Promise<SubmitResponse> {
  return apiRequest<SubmitResponse>('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ confidenceGoal, speakingFrequency, practicePreference }),
  });
}
