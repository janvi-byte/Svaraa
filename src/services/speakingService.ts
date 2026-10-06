import { apiGet, apiPost, apiUpload } from './api';

export type TranscriptionResponse = {
  transcript: string;
  language: string;
  duration_seconds: number;
};

export function transcribeAudio(
  audio: Blob,
  durationSeconds: number
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  const extension = audio.type.split('/')[1] || 'webm';

  formData.append('audio', audio, `recording.${extension}`);
  formData.append('durationSeconds', String(durationSeconds));

  return apiUpload<TranscriptionResponse>(
    '/speaking/transcribe',
    formData
  );
}

export type GrammarError = {
  original: string;
  correction: string;
  explanation: string;
  category: string;
};

export type VocabularyUpgrade = {
  usedWord: string;
  suggestedWord: string;
  meaning: string;
  preferredLanguage: string;
  translation: string;
  reason: string;
  examples: string[];
};

export type SpeakingAnalysis = {
  overall: number;
  improved_answer: string;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pacing: number;
  filler_count: number;
  words_per_minute: number;
  vocabulary_diversity: number;
  repeated_phrase_count: number;
  grammar_errors: GrammarError[];
  vocabulary_upgrades: VocabularyUpgrade[];
  preferred_language: string;
  feedback: string[];
  strengths: string[];
};

export function analyzeSpeaking(
  transcript: string,
  durationSeconds: number,
  preferredLanguage = 'English'
): Promise<SpeakingAnalysis> {
  return apiPost<SpeakingAnalysis>('/speaking/analyze', {
    transcript,
    duration_seconds: durationSeconds,
    preferred_language: preferredLanguage,
  });
}

export type SpeakingTopic = {
  _id: string;
  title?: string;
  prompt?: string;
  category?: string;
  difficulty?: string;
  durationSeconds?: number;
};

export type RandomTopicResponse = {
  topic: SpeakingTopic;
};

export function getRandomTopic(
  excludeTopicId?: string,
  adaptive = false
): Promise<RandomTopicResponse> {
  const params = new URLSearchParams();
  if (excludeTopicId) {
    params.set('excludeTopicId', excludeTopicId);
  }
  if (adaptive) {
    params.set('adaptive', 'true');
  }

  const query = params.toString() ? `?${params.toString()}` : '';

  return apiGet<RandomTopicResponse>(
    `/speaking/topics/random${query}`
  );
}

export type SpeakingAnalysisSummary = {
  overall: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pacing: number;
  fillerCount: number;
  wordsPerMinute: number;
  vocabularyDiversity: number;
  repeatedPhraseCount: number;
  status: 'pending' | 'complete';
};

export type SpeakingSession = {
  _id: string;
  user: string;
  topic: SpeakingTopic | string;
  transcript?: string;
  durationSeconds: number;
  status: 'started' | 'submitted' | 'analyzed';
  analysis?: SpeakingAnalysisSummary | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StartSpeakingSessionResponse = {
  session: SpeakingSession;
};

export function startSpeakingSession(
  topicId: string
): Promise<StartSpeakingSessionResponse> {
  return apiPost<StartSpeakingSessionResponse>('/speaking/start', {
    topicId,
  });
}

export type SavedAnalysis = SpeakingAnalysis & {
  _id?: string;
  session?: string;
  fillerCount?: number;
  wordsPerMinute?: number;
  vocabularyDiversity?: number;
  repeatedPhraseCount?: number;
  grammarErrors?: GrammarError[];
  vocabularyUpgrades?: VocabularyUpgrade[];
  preferredLanguage?: string;
  improvedAnswer?: string;
  status?: 'pending' | 'complete';
  createdAt?: string;
  updatedAt?: string;
};

export type SubmitSpeakingSessionResponse = {
  session: SpeakingSession;
  analysis: SavedAnalysis;
  service?: string;
};

export function submitSpeakingSession(
  sessionId: string,
  transcript: string,
  durationSeconds: number,
  preferredLanguage = 'English'
): Promise<SubmitSpeakingSessionResponse> {
  return apiPost<SubmitSpeakingSessionResponse>(
    `/speaking/${sessionId}/submit`,
    {
      transcript,
      durationSeconds,
      preferredLanguage,
    }
  );
}

export type SpeakingHistoryResponse = {
  sessions: SpeakingSession[];
};

export function getSpeakingHistory(): Promise<SpeakingHistoryResponse> {
  return apiGet<SpeakingHistoryResponse>('/speaking/history');
}