import { Mic, Pause, RotateCcw, Square } from 'lucide-react';
import { useEffect, useState } from 'react';

type AudioRecorderProps = { compact?: boolean };
export function AudioRecorder({ compact = false }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { if (!recording) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [recording]);
  const format = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return <div className={`recorder ${compact ? 'compact' : ''}`}><div className="recorder-wave">{Array.from({ length: compact ? 18 : 36 }).map((_, index) => <span key={index} style={{ height: `${18 + ((index * 17) % 34)}%` }} className={recording ? 'live' : ''} />)}</div><div className="recorder-footer"><span className="record-time">{format}</span>{!compact && <span className="record-hint">{recording ? 'Listening… take your time' : 'Your microphone is ready'}</span>}<div className="record-controls">{seconds > 0 && <button className="icon-button subtle" onClick={() => { setSeconds(0); setRecording(false); }} aria-label="Reset recording"><RotateCcw size={16} /></button>}<button className={`record-button ${recording ? 'recording' : ''}`} onClick={() => setRecording(!recording)} aria-label={recording ? 'Pause recording' : 'Start recording'}>{recording ? <Pause size={18} fill="currentColor" /> : <Mic size={20} />}</button>{recording && <button className="icon-button subtle" onClick={() => setRecording(false)} aria-label="Stop recording"><Square size={15} fill="currentColor" /></button>}</div></div></div>;
}
