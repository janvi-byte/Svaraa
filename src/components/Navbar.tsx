import { Bell, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type NavbarProps = { onMenu: () => void; onNavigate: (path: string) => void };

export function Navbar({ onMenu, onNavigate }: NavbarProps) {
  const { user } = useAuth();
  const displayName = user?.name || 'Alex Rivera';
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <button className="brand" onClick={() => onNavigate('/dashboard')} aria-label="Go to dashboard">
        <span className="brand-mark"><Sparkles size={17} /></span><span>Speakora</span>
      </button>
      <div className="topbar-actions">
        <button className="streak-pill" onClick={() => onNavigate('/progress')}><span>7</span> day streak</button>
        <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
        <button className="profile-chip" onClick={() => onNavigate('/profile')}><span className="avatar small">{initials}</span><span className="profile-name">{displayName}</span><ChevronDown size={16} /></button>
      </div>
    </header>
  );
}
