import { Bell, ChevronDown, Menu, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSpeakingHistory,
  type SpeakingSession,
} from '@/services/speakingService';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from '@/services/profileService';

type NavbarProps = {
  onMenu: () => void;
  onNavigate: (path: string) => void;
};

export function Navbar({ onMenu, onNavigate }: NavbarProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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

    async function loadNotifications() {
      try {
        const response = await getNotifications();
        if (mounted) {
          setNotifications(response.notifications || []);
          setUnreadCount(response.unreadCount || 0);
        }
      } catch {
        if (mounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    }

    loadHistory();
    loadNotifications();

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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

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

        <div className="notification-wrapper">
          <button
            className="icon-button"
            aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
              onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown" role="dialog" aria-label="Notifications">
              <div className="notification-header">
                <strong>Notifications</strong>
                <div className="notification-header-actions">
                  {unreadCount > 0 && (
                    <button
                      className="text-link"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    className="icon-button"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <p className="notification-empty">
                  No notifications yet. Complete a practice to get updates.
                </p>
              ) : (
                <div className="notification-list">
                  {notifications.slice(0, 10).map((notification) => (
                    <button
                      key={notification._id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-date">
                        {new Date(notification.createdAt).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
