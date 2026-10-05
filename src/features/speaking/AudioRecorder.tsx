import { Mic, Pause, RotateCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type AudioRecorderProps = {
  compact?: boolean;
  onRecordingComplete?: (blob: Blob, durationSeconds: number) => void;
};

export function AudioRecorder({ compact = false, onRecordingComplete }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
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
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        cleanupStream();
        if (onRecordingComplete && blob.size > 0) {
          onRecordingComplete(blob, secondsRef.current);
        }
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);
    } catch {
      setError('Could not access your microphone. Please check your browser permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const resetRecording = () => {
    stopRecording();
    chunksRef.current = [];
    setSeconds(0);
    setError('');
  };

  const format = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className={`recorder ${compact ? 'compact' : ''}`}>
      <div className="recorder-wave">
        {Array.from({ length: compact ? 18 : 36 }).map((_, index) => (
          <span key={index} style={{ height: `${18 + ((index * 17) % 34)}%` }} className={recording ? 'live' : ''} />
        ))}
      </div>
      {error && <p className="auth-error" role="alert" style={{ textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
      <div className="recorder-footer">
        <span className="record-time">{format}</span>
        {!compact && <span className="record-hint">{recording ? 'Listening… take your time' : 'Your microphone is ready'}</span>}
        <div className="record-controls">
          {seconds > 0 && (
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
            <button className="icon-button subtle" onClick={stopRecording} aria-label="Stop recording">
              <Pause size={18} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
