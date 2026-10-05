import {
  analyzeSpeaking,
  transcribeAudio,
  type SpeakingAnalysis,
  type TranscriptionResponse,
} from './speakingService';

let latestTranscription: TranscriptionResponse | null = null;
let latestAnalysis: SpeakingAnalysis | null = null;

export function getLatestTranscription(): TranscriptionResponse | null {
  return latestTranscription;
}

export function getLatestAnalysis(): SpeakingAnalysis | null {
  return latestAnalysis;
}

export function clearLatestTranscription(): void {
  latestTranscription = null;
}

export function clearLatestAnalysis(): void {
  latestAnalysis = null;
}

export async function submitRecording(
  audio: Blob,
  durationSeconds: number
): Promise<TranscriptionResponse> {

  const result = await transcribeAudio(audio, durationSeconds);

  latestTranscription = result;

  latestAnalysis = await analyzeSpeaking(
    result.transcript,
    durationSeconds
  );

  return result;
}