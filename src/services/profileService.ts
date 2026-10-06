import { apiGet, apiPost } from './api';

export type SpeakingProfileData = {
  sessionsAnalyzed: number;
  avgOverall: number;
  avgGrammar: number;
  avgFluency: number;
  avgVocabulary: number;
  avgPacing: number;
  avgFillerCount?: number;
  avgWpm?: number;
  avgVocabularyDiversity?: number;
  avgRepeatedPhraseCount?: number;
  strongestSkill: string;
  weakestSkill: string;
  improvingSkill: string;
  decliningSkill: string;
  currentDifficulty: string;
};

export type OverusedWord = {
  word: string;
  count: number;
};

export type ProfileResponse = {
  profile: SpeakingProfileData;
  overusedWords: OverusedWord[];
  nextChallenge: string;
  vocabularyProfile?: {
    totalWordsUsed: number;
    words: { word: string; count: number }[];
    targetWords: { word: string; practicedCount: number; improvedCount: number }[];
  };
};

export function getProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>('/profile');
}

export type RetryAttempt = {
  session: string;
  transcript: string;
  overall: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pacing: number;
  fillerCount: number;
  wordsPerMinute: number;
  vocabularyDiversity: number;
  repeatedPhraseCount: number;
  durationSeconds: number;
  createdAt: string;
};

export type RetryComparison = {
  firstAttempt: RetryAttempt;
  lastAttempt: RetryAttempt;
  changes: Record<string, number>;
  attemptCount: number;
};

export type RetryGroupData = {
  _id: string;
  topic: { _id: string; title: string; prompt: string } | string;
  attempts: RetryAttempt[];
};

export type StartRetryResponse = {
  session: { _id: string };
  retryGroup: RetryGroupData;
};

export function startRetry(topicId: string): Promise<StartRetryResponse> {
  return apiPost<StartRetryResponse>('/retry/start', { topicId });
}

export function getRetryComparison(
  retryGroupId: string
): Promise<{ retryGroup: RetryGroupData; comparison: RetryComparison | null; message?: string }> {
  return apiGet(`/retry/${retryGroupId}/comparison`);
}

export function getRetryHistory(): Promise<{ retryGroups: RetryGroupData[] }> {
  return apiGet<{ retryGroups: RetryGroupData[] }>('/retry/history');
}
