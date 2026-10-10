import { Mic, Pause, Play, RotateCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type AudioRecorderProps = {
  compact?: boolean;
  classicAppearance?: boolean;
  maxDurationSeconds?: number;
  onRecordingComplete?: (blob: Blob, durationSeconds: number) => void;
  onCountdownChange?: (remainingSeconds: number) => void;
  onRecordingStateChange?: (recording: boolean) => void;
  onReset?: () => void;
  onTimeLimitReached?: (hasRecording: boolean) => void;
};

export function AudioRecorder({
  compact = false,
  classicAppearance = false,
  maxDurationSeconds,
  onRecordingComplete,
  onCountdownChange,
  onRecordingStateChange,
  onReset,
  onTimeLimitReached,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const secondsRef = useRef(0);
  const elapsedMillisecondsRef = useRef(0);
  const segmentStartedAtRef = useRef(0);
  const autoStoppedRef = useRef(false);
  const startingRef = useRef(false);
  const reportedRemainingRef = useRef(maxDurationSeconds ?? Number.POSITIVE_INFINITY);
  const callbacksRef = useRef({
    onRecordingComplete,
    onCountdownChange,
    onRecordingStateChange,
    onReset,
    onTimeLimitReached,
  });

  useEffect(() => {
    callbacksRef.current = {
      onRecordingComplete,
      onCountdownChange,
      onRecordingStateChange,
      onReset,
      onTimeLimitReached,
    };
  }, [
    onRecordingComplete,
    onCountdownChange,
    onRecordingStateChange,
    onReset,
    onTimeLimitReached,
  ]);

  const limitSeconds =
    typeof maxDurationSeconds === 'number' &&
    Number.isFinite(maxDurationSeconds) &&
    maxDurationSeconds > 0
      ? maxDurationSeconds
      : Number.POSITIVE_INFINITY;

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const updateElapsedTime = (now = performance.now()) => {
    const elapsed =
      elapsedMillisecondsRef.current +
      (segmentStartedAtRef.current ? now - segmentStartedAtRef.current : 0);
    const totalSeconds = Math.floor(elapsed / 1000);
    secondsRef.current = totalSeconds;
    setSeconds((current) => (current === totalSeconds ? current : totalSeconds));
    return elapsed;
  };

  const stopRecording = () => {
    if (recording && !paused && segmentStartedAtRef.current) {
      const elapsed = updateElapsedTime();
      elapsedMillisecondsRef.current = Math.min(elapsed, limitSeconds * 1000);
      segmentStartedAtRef.current = 0;
      const totalSeconds = Math.min(
        Math.floor(elapsedMillisecondsRef.current / 1000),
        limitSeconds
      );
      secondsRef.current = totalSeconds;
      setSeconds(totalSeconds);
      const remaining = Math.max(limitSeconds - totalSeconds, 0);
      if (remaining !== reportedRemainingRef.current) {
        reportedRemainingRef.current = remaining;
        callbacksRef.current.onCountdownChange?.(remaining);
      }
      if (elapsed >= limitSeconds * 1000) {
        autoStoppedRef.current = true;
      }
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setRecording(false);
    setPaused(false);
    callbacksRef.current.onRecordingStateChange?.(false);
  };

  const startRecording = async () => {
    if (startingRef.current || recording) return;
    if (autoStoppedRef.current && secondsRef.current >= limitSeconds) {
      return;
    }
    startingRef.current = true;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        cleanupStream();
        if (blob.size > 0) {
          callbacksRef.current.onRecordingComplete?.(blob, secondsRef.current);
        }
        if (autoStoppedRef.current) {
          callbacksRef.current.onTimeLimitReached?.(blob.size > 0);
        }
      };

      recorder.start();
      elapsedMillisecondsRef.current = 0;
      segmentStartedAtRef.current = performance.now();
      secondsRef.current = 0;
      reportedRemainingRef.current = limitSeconds;
      autoStoppedRef.current = false;
      setRecording(true);
      setPaused(false);
      setSeconds(0);
      callbacksRef.current.onRecordingStateChange?.(true);
      if (Number.isFinite(limitSeconds)) {
        callbacksRef.current.onCountdownChange?.(limitSeconds);
      }
    } catch {
      setError('Could not access your microphone. Please check your browser permissions and try again.');
      cleanupStream();
    } finally {
      startingRef.current = false;
    }
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !recording) return;

    if (paused && recorder.state === 'paused') {
      recorder.resume();
      segmentStartedAtRef.current = performance.now();
      setPaused(false);
      return;
    }

    if (!paused && recorder.state === 'recording') {
      elapsedMillisecondsRef.current = updateElapsedTime();
      segmentStartedAtRef.current = 0;
      recorder.pause();
      const remaining = Math.max(limitSeconds - secondsRef.current, 0);
      reportedRemainingRef.current = remaining;
      callbacksRef.current.onCountdownChange?.(remaining);
      setPaused(true);
    }
  };

  const resetRecording = () => {
    stopRecording();
    chunksRef.current = [];
    elapsedMillisecondsRef.current = 0;
    segmentStartedAtRef.current = 0;
    secondsRef.current = 0;
    autoStoppedRef.current = false;
    reportedRemainingRef.current = limitSeconds;
    setSeconds(0);
    setError('');
    callbacksRef.current.onReset?.();
    if (Number.isFinite(limitSeconds)) {
      callbacksRef.current.onCountdownChange?.(limitSeconds);
    }
  };

  useEffect(() => {
    if (!recording || paused) return;

    if (!Number.isFinite(limitSeconds)) {
      const timer = window.setInterval(() => {
        setSeconds((current) => {
          secondsRef.current = current + 1;
          return current + 1;
        });
      }, 1000);
      return () => window.clearInterval(timer);
    }

    const timer = window.setInterval(() => {
      const elapsed = updateElapsedTime();
      const totalSeconds = Math.min(Math.floor(elapsed / 1000), limitSeconds);
      const remaining = Math.max(limitSeconds - totalSeconds, 0);

      if (remaining !== reportedRemainingRef.current) {
        reportedRemainingRef.current = remaining;
        callbacksRef.current.onCountdownChange?.(remaining);
      }

      if (elapsed >= limitSeconds * 1000) {
        elapsedMillisecondsRef.current = limitSeconds * 1000;
        segmentStartedAtRef.current = 0;
        secondsRef.current = limitSeconds;
        setSeconds(limitSeconds);
        autoStoppedRef.current = true;
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        setRecording(false);
        setPaused(false);
        callbacksRef.current.onRecordingStateChange?.(false);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [recording, paused, limitSeconds]);

  const format = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const recorderState = recording ? (paused ? 'paused' : 'recording') : seconds > 0 ? 'ready' : 'idle';
  const hint =
    recorderState === 'recording'
      ? 'Listening… take your time'
      : recorderState === 'ready'
        ? 'Captured — replay or finish below'
        : 'Tap the mic when you are ready';

  return (
    <div
      className={
        classicAppearance
          ? `recorder ${compact ? 'compact' : ''}`
          : `recorder ${recording ? 'is-recording' : ''}`
      }
      {...(!classicAppearance ? { 'data-state': recorderState } : {})}
    >
      <div
        className={
          classicAppearance
            ? 'recorder-wave'
            : `recorder-wave ${!recording && seconds > 0 ? 'captured' : ''}`
        }
        aria-hidden="true"
      >
        {Array.from({ length: compact ? 18 : 36 }).map((_, index) => (
          <span
            key={index}
            style={
              classicAppearance
                ? { height: `${18 + ((index * 17) % 34)}%` }
                : { animationDelay: `${(index % 9) * 0.11}s` }
            }
            className={recording && !paused ? 'live' : ''}
          />
        ))}
      </div>
      {error && <p className="auth-error" role="alert" style={{ textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
      <div className="recorder-footer">
        <span className="record-time">{format}</span>
        {!compact && (
          <span
            className="record-hint"
            role={classicAppearance ? undefined : 'status'}
          >
            {classicAppearance
              ? recording
                ? 'Listening… take your time'
                : 'Your microphone is ready'
              : hint}
          </span>
        )}
        <div className="record-controls">
          {seconds > 0 && (classicAppearance || !recording) && (
            <button className="icon-button subtle" onClick={resetRecording} aria-label="Reset recording">
              <RotateCcw size={16} />
            </button>
          )}
          <button
            className={`record-button ${recording ? 'recording' : ''}`}
            onClick={() => (recording ? stopRecording() : startRecording())}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? <Square size={15} fill="currentColor" /> : <Mic size={20} />}
          </button>
          {recording && (
            <button
              className="icon-button subtle"
              onClick={() =>
                Number.isFinite(limitSeconds) ? togglePause() : stopRecording()
              }
              aria-label={
                Number.isFinite(limitSeconds)
                  ? paused ? 'Resume recording' : 'Pause recording'
                  : 'Stop recording'
              }
            >
              {Number.isFinite(limitSeconds) && paused ? (
                <Play size={18} fill="currentColor" />
              ) : (
                <Pause size={18} fill="currentColor" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
