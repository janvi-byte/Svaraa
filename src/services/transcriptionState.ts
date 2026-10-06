import {
  submitSpeakingSession,
  transcribeAudio,
  type SpeakingAnalysis,
  type SpeakingSession,
  type TranscriptionResponse,
} from './speakingService';

let latestTranscription: TranscriptionResponse | null = null;
let latestAnalysis: SpeakingAnalysis | null = null;
let latestSession: SpeakingSession | null = null;

export function getLatestTranscription(): TranscriptionResponse | null {
  return latestTranscription;
}

export function getLatestAnalysis(): SpeakingAnalysis | null {
  return latestAnalysis;
}

export function getLatestSession(): SpeakingSession | null {
  return latestSession;
}

export function setLatestSession(session: SpeakingSession): void {
  latestSession = session;
}

export function clearLatestTranscription(): void {
  latestTranscription = null;
}

export function clearLatestAnalysis(): void {
  latestAnalysis = null;
}

export function clearLatestSession(): void {
  latestSession = null;
}

export async function submitRecording(
  audio: Blob,
  durationSeconds: number,
  preferredLanguage = 'English'
): Promise<{
  transcription: TranscriptionResponse;
  session: SpeakingSession;
  analysis: SpeakingAnalysis;
}> {
  if (!latestSession?._id) {
    throw new Error(
      'No active speaking session. Please start the practice again.'
    );
  }

  const transcription = await transcribeAudio(
    audio,
    durationSeconds
  );

  latestTranscription = transcription;

  const result = await submitSpeakingSession(
    latestSession._id,
    transcription.transcript,
    durationSeconds,
    preferredLanguage
  );

  latestSession = result.session;

  latestAnalysis = {
    overall: result.analysis.overall ?? 0,
    fluency: result.analysis.fluency ?? 0,
    vocabulary: result.analysis.vocabulary ?? 0,
    grammar: result.analysis.grammar ?? 0,
    pacing: result.analysis.pacing ?? 0,
    filler_count:
      result.analysis.filler_count ??
      result.analysis.fillerCount ??
      0,
    words_per_minute:
      result.analysis.words_per_minute ??
      result.analysis.wordsPerMinute ??
      0,
    vocabulary_diversity:
      result.analysis.vocabulary_diversity ??
      result.analysis.vocabularyDiversity ??
      0,
    repeated_phrase_count:
      result.analysis.repeated_phrase_count ??
      result.analysis.repeatedPhraseCount ??
      0,
    grammar_errors:
      result.analysis.grammar_errors ??
      result.analysis.grammarErrors ??
      [],
    vocabulary_upgrades:
      result.analysis.vocabulary_upgrades ??
      result.analysis.vocabularyUpgrades ??
      [],
    preferred_language:
      result.analysis.preferred_language ??
      result.analysis.preferredLanguage ??
      preferredLanguage,
    feedback: result.analysis.feedback ?? [],
    strengths: result.analysis.strengths ?? [],
  };

  return {
    transcription,
    session: result.session,
    analysis: latestAnalysis,
  };
}