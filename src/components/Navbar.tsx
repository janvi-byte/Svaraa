import { Bell, ChevronDown, Menu, Sparkles } from 'lucide-react';

type NavbarProps = { onMenu: () => void; onNavigate: (path: string) => void };

export function Navbar({ onMenu, onNavigate }: NavbarProps) {
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <button className="brand" onClick={() => onNavigate('/dashboard')} aria-label="Go to dashboard">
        <span className="brand-mark"><Sparkles size={17} /></span><span>Speakora</span>
      </button>
      <div className="topbar-actions">
        <button className="streak-pill" onClick={() => onNavigate('/progress')}><span>7</span> day streak</button>
        <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
        <button className="profile-chip" onClick={() => onNavigate('/profile')}><span className="avatar small">AR</span><span className="profile-name">Alex Rivera</span><ChevronDown size={16} /></button>
      </div>
    </header>
  );
}
