import { apiUpload } from './api';

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
