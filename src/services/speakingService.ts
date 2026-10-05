import { apiPost, apiUpload } from './api';
export type TranscriptionResponse = {
  transcript: string;
  language: string;
  duration_seconds: number;
};

export function transcribeAudio(audio: Blob, durationSeconds: number): Promise<TranscriptionResponse> {
  const formData = new FormData();
  const extension = audio.type.split('/')[1] || 'webm';
  formData.append('audio', audio, `recording.${extension}`);
  formData.append('durationSeconds', String(durationSeconds));
  return apiUpload<TranscriptionResponse>('/speaking/transcribe', formData);
}
export type SpeakingAnalysis = {
  overall: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pacing: number;
  filler_count: number;
  words_per_minute: number;
  vocabulary_diversity: number;
  repeated_phrase_count: number;
  feedback: string[];
  strengths: string[];
};

export function analyzeSpeaking(
  transcript: string,
  durationSeconds: number
): Promise<SpeakingAnalysis> {
  return apiPost<SpeakingAnalysis>('/speaking/analyze', {
    transcript,
    duration_seconds: durationSeconds,
  });
}