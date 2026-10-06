import { Bell, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSpeakingHistory,
  type SpeakingSession,
} from '@/services/speakingService';

type NavbarProps = {
  onMenu: () => void;
  onNavigate: (path: string) => void;
};

export function Navbar({ onMenu, onNavigate }: NavbarProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);

  const displayName = user?.name || 'Alex Rivera';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const response = await getSpeakingHistory();

        if (mounted) {
          setSessions(response.sessions || []);
        }
      } catch {
        if (mounted) {
          setSessions([]);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const analyzedSessions = sessions.filter(
    (session) =>
      session.status === 'analyzed' &&
      session.analysis?.status === 'complete'
  );

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;

  const practiceDates = new Set(
    analyzedSessions
      .map((session) => {
        if (!session.createdAt) {
          return '';
        }

        return getDateKey(new Date(session.createdAt));
      })
      .filter(Boolean)
  );

  const today = new Date();
  let streak = 0;
  const streakDate = new Date(today);

  while (practiceDates.has(getDateKey(streakDate))) {
    streak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  return (
    <header className="topbar">
      <button
        className="mobile-menu icon-button"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <button
        className="brand"
        onClick={() => onNavigate('/dashboard')}
        aria-label="Go to dashboard"
      >
        <span className="brand-mark">
          <Sparkles size={17} />
        </span>
        <span>Speakora</span>
      </button>

      <div className="topbar-actions">
        <button
          className="streak-pill"
          onClick={() => onNavigate('/progress')}
        >
          <span>{streak}</span> day streak
        </button>

        <button className="icon-button" aria-label="Notifications">
          <Bell size={19} />
        </button>

        <button
          className="profile-chip"
          onClick={() => onNavigate('/profile')}
        >
          <span className="avatar small">{initials}</span>
          <span className="profile-name">{displayName}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}