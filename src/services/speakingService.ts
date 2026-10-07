import { apiGet, apiPost, apiUpload } from './api';

export type TranscriptionSegment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptionResponse = {
  transcript: string;
  language: string;
  duration_seconds: number;
  segments?: TranscriptionSegment[];
};

export type PronunciationReference = {
  id: string;
  text: string;
  difficulty: string;
  category: string;
};

export type ReferenceAlignmentResponse = {
  reference: {
    id: string;
    text: string;
  };
  transcript: string;
  words?: {
    word: string;
    start: number;
    end: number;
  }[];
  comparison?: {
    referenceWordCount: number;
    recognizedWordCount: number;
    missingWords: string[];
    extraWords: string[];
    recognizedTextMatchesReference: boolean;
  };
};

export function getPronunciationReferences(): Promise<{
  references: PronunciationReference[];
}> {
  return apiGet<{ references: PronunciationReference[] }>(
    '/speaking/pronunciation-references'
  );
}

export function alignReferenceAudio(
  audio: Blob,
  referenceId: string,
  durationSeconds: number
): Promise<ReferenceAlignmentResponse> {
  const formData = new FormData();
  const extension = audio.type.split('/')[1] || 'webm';
  formData.append('audio', audio, `reference-recording.${extension}`);
  formData.append('referenceId', referenceId);
  formData.append('durationSeconds', String(durationSeconds));

  return apiUpload<ReferenceAlignmentResponse>(
    '/speaking/pronunciation-reference/align',
    formData
  );
}

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

export type RepeatedVocabularyWord = {
  word: string;
  count: number;
};

export type VocabularySummary = {
  contentWords: string[];
  uniqueWords: string[];
  newWords: string[];
  previouslyUsedWords: string[];
  repeatedWords: RepeatedVocabularyWord[];
  contentWordCount: number;
  contentVocabularyDiversity: number;
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
  vocabularySummary?: VocabularySummary;
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

export type NextChallengeFocus = {
  skill: string;
  averageScore: number;
  overallAverage: number;
  difficulty: string;
  message: string;
};

export type NextChallengeResponse = {
  topic: SpeakingTopic;
  personalized: boolean;
  focus?: NextChallengeFocus;
  analyzedSessionCount?: number;
};

export function getNextChallenge(
  excludeTopicId?: string
): Promise<NextChallengeResponse> {
  const query = excludeTopicId
    ? `?excludeTopicId=${encodeURIComponent(excludeTopicId)}`
    : '';

  return apiGet<NextChallengeResponse>(
    `/speaking/topics/next${query}`
  );
}

export type PresentationTopic = SpeakingTopic;

export type PresentationTopicsResponse = {
  topics: PresentationTopic[];
};

export function getPresentationTopics(): Promise<PresentationTopicsResponse> {
  return apiGet<PresentationTopicsResponse>('/speaking/presentation-topics');
}

export function startPresentation(): Promise<StartSpeakingSessionResponse> {
  return apiPost<StartSpeakingSessionResponse>('/speaking/presentation/start', {});
}

export type PresentationCompletionResponse = {
  session: SpeakingSession;
  analysis: SavedAnalysis;
  vocabulary?: VocabularySummary;
  service?: string;
};

export function completePresentation(
  sessionId: string,
  transcript: string,
  durationSeconds: number,
  preferredLanguage = 'English'
): Promise<PresentationCompletionResponse> {
  return apiPost<PresentationCompletionResponse>(
    `/speaking/presentation/${sessionId}/complete`,
    { transcript, durationSeconds, preferredLanguage }
  );
}

export type SpeakingProfile = {
  _id?: string;
  user?: string;
  sessionsAnalyzed: number;
  averageOverall: number;
  averageGrammar: number;
  averageFluency: number;
  averageVocabulary: number;
  averagePacing: number;
  averageWordsPerMinute: number;
  averageFillerCount: number;
  averageVocabularyDiversity: number;
  averageRepeatedPhraseCount: number;
  strongestSkill: string;
  weakestSkill: string;
  improvingSkill: string;
  decliningSkill: string;
  difficulty: string;
  recentScoreTrend?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function getSpeakingProfile(): Promise<{
  profile: SpeakingProfile;
}> {
  return apiGet<{ profile: SpeakingProfile }>(
    '/speaking/profile'
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
  retryGroup?: string;
  analysis?: SpeakingAnalysisSummary | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StartSpeakingSessionResponse = {
  session: SpeakingSession;
};

export function startSpeakingSession(
  topicId: string,
  retryGroup?: string
): Promise<StartSpeakingSessionResponse> {
  return apiPost<StartSpeakingSessionResponse>('/speaking/start', {
    topicId,
    ...(retryGroup ? { retryGroup } : {}),
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
  vocabulary?: VocabularySummary;
  createdAt?: string;
  updatedAt?: string;
};

export type SubmitSpeakingSessionResponse = {
  session: SpeakingSession;
  analysis: SavedAnalysis;
  vocabulary?: VocabularySummary;
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

export type AnalyticsPoint = {
  date: string;
  sessionId: string;
  value: number;
};

export type AnalyticsTopic = {
  title?: string;
  category?: string;
  difficulty?: string;
};

export type AnalyticsRecentSession = {
  sessionId: string;
  date: string;
  durationSeconds: number;
  overall: number;
  grammar: number;
  fluency: number;
  vocabulary: number;
  pacing: number;
  wordsPerMinute: number;
  fillerCount: number;
  repeatedPhraseCount: number;
  vocabularyDiversity: number;
  retryGroup: string | null;
  topic?: AnalyticsTopic;
};

export type AnalyticsMilestone = {
  type: 'first-session' | 'fifth-session' | 'personal-best';
  title: string;
  description: string;
  sessionId: string;
  date: string;
};

export type SpeakingAnalytics = {
  summary: {
    sessionsAnalyzed: number;
    averageOverall: number;
    bestOverall: number;
    latestOverall: number;
    totalSpeakingTimeSeconds: number;
    strongestSkill?: string;
    weakestSkill?: string;
  };
  timeSeries: {
    overall: AnalyticsPoint[];
    grammar: AnalyticsPoint[];
    fluency: AnalyticsPoint[];
    vocabulary: AnalyticsPoint[];
    pacing: AnalyticsPoint[];
    wordsPerMinute: AnalyticsPoint[];
    fillerCount: AnalyticsPoint[];
    repeatedPhraseCount: AnalyticsPoint[];
    vocabularyDiversity: AnalyticsPoint[];
    durationSeconds: AnalyticsPoint[];
  };
  recentSessions: AnalyticsRecentSession[];
  milestones: AnalyticsMilestone[];
};

export function getSpeakingAnalytics(): Promise<SpeakingAnalytics> {
  return apiGet<SpeakingAnalytics>('/speaking/analytics');
}

export type AttemptTrend = 'improved' | 'declined' | 'unchanged';

export type AttemptMetricComparison = {
  key: string;
  label: string;
  first: number;
  latest: number;
  delta: number;
  trend: AttemptTrend;
};

export type RetryAttemptsResponse = {
  retryGroup: string;
  attemptCount: number;
  attempts: SpeakingSession[];
};

export type AttemptSummary = {
  sessionId: string;
  attemptNumber: number;
  createdAt?: string;
};

export type AttemptComparisonResponse = {
  retryGroup: string;
  attemptCount: number;
  analyzedAttemptCount: number;
  firstAttempt: AttemptSummary | null;
  latestAttempt: AttemptSummary | null;
  comparison: AttemptMetricComparison[] | null;
  overallTrend: AttemptTrend | null;
};

export function getRetryAttempts(
  retryGroup: string
): Promise<RetryAttemptsResponse> {
  return apiGet<RetryAttemptsResponse>(
    `/speaking/attempts/${encodeURIComponent(retryGroup)}`
  );
}

export function compareRetryAttempts(
  retryGroup: string
): Promise<AttemptComparisonResponse> {
  return apiGet<AttemptComparisonResponse>(
    `/speaking/attempts/${encodeURIComponent(retryGroup)}/compare`
  );
}