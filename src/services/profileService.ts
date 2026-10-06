import { apiGet, apiPost, apiPut } from './api';

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
  recentScoreTrend: string;
  currentDifficulty: string;
};

export type OverusedWord = {
  word: string;
  count: number;
};

export type Preferences = {
  preferredLanguage: string;
  practiceGoal: string;
  preferredTutor: string;
  difficulty: string;
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
  preferences?: Preferences;
};

export function getProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>('/profile');
}

export type LessonContent = {
  explanation: string;
  examples: string[];
  exercisePrompt: string;
};

export type Lesson = {
  _id: string;
  skill: string;
  title: string;
  description: string;
  content: LessonContent;
  status: 'assigned' | 'in-progress' | 'completed';
  scoreAfter?: number;
};

export function getLessons(): Promise<{ lessons: Lesson[] }> {
  return apiGet<{ lessons: Lesson[] }>('/profile/lessons');
}

export function completeLesson(
  lessonId: string,
  scoreAfter: number
): Promise<{ lesson: Lesson }> {
  return apiPost<{ lesson: Lesson }>(
    `/profile/lessons/${lessonId}/complete`,
    { scoreAfter }
  );
}

export type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function getNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  return apiGet<{ notifications: Notification[]; unreadCount: number }>(
    '/notifications'
  );
}

export function markNotificationRead(
  notificationId: string
): Promise<{ notification: Notification }> {
  return apiPut<{ notification: Notification }>(
    `/notifications/${notificationId}/read`,
    {}
  );
}

export function markAllNotificationsRead(): Promise<{ message: string }> {
  return apiPut<{ message: string }>('/notifications/read-all', {});
}

export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
};

export type Conversation = {
  _id: string;
  tutor: string;
  topic?: string;
  mode?: 'conversation' | 'roleplay' | 'debate';
  scenario?: string;
  debateTopic?: string;
  debatePosition?: 'for' | 'against';
  messages: ConversationMessage[];
};

export type StartConversationResponse = {
  conversation: Conversation;
  aiReply: string;
};

export function startConversation(options: {
  tutor?: string;
  topic?: string;
  mode?: string;
  scenario?: string;
  debateTopic?: string;
  debatePosition?: string;
}): Promise<StartConversationResponse> {
  return apiPost<StartConversationResponse>('/conversation/start', options);
}

export function sendMessage(
  conversationId: string,
  content: string
): Promise<{ conversation: Conversation; aiReply: string }> {
  return apiPost<{ conversation: Conversation; aiReply: string }>(
    `/conversation/${conversationId}/message`,
    { content }
  );
}

export function getConversationHistory(): Promise<{ conversations: Conversation[] }> {
  return apiGet<{ conversations: Conversation[] }>('/conversation/history');
}

export function getTutors(): Promise<{
  tutors: { name: string; style: string }[];
  scenarios: { id: string; label: string }[];
  debateTopics: { id: string; title: string; prompt: string }[];
}> {
  return apiGet('/conversation/tutors');
}

export function updatePreferences(prefs: Partial<Preferences>): Promise<{
  preferences: Preferences;
}> {
  return apiPut<{ preferences: Preferences }>('/profile/preferences', prefs);
}

export type PronunciationResult = {
  difficult_words: {
    word: string;
    syllables: number;
    guidance: string;
    example: string;
  }[];
  total_words: number;
  unique_words: number;
  note: string;
};

export function checkPronunciation(
  transcript: string
): Promise<PronunciationResult> {
  return apiPost<PronunciationResult>('/speaking/analyze/pronunciation', {
    transcript,
  });
}
