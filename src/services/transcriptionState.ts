import { transcribeAudio, type TranscriptionResponse } from './speakingService';

let latestTranscription: TranscriptionResponse | null = null;

export function getLatestTranscription(): TranscriptionResponse | null {
  return latestTranscription;
}

export function clearLatestTranscription(): void {
  latestTranscription = null;
}

export async function submitRecording(audio: Blob, durationSeconds: number): Promise<TranscriptionResponse> {
  const result = await transcribeAudio(audio, durationSeconds);
  latestTranscription = result;
  return result;
}
