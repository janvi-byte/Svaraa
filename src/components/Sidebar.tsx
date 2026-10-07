import { BarChart3, BookOpen, Compass, Headphones, LayoutDashboard, MessageCircle, Settings, Sparkles, UserRound, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

type SidebarProps = { activePath: string; open: boolean; onClose: () => void; onNavigate: (path: string) => void };
const items = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Practice', path: '/practice', icon: Headphones },
  { label: 'Open conversation', path: '/conversation', icon: MessageCircle },
  { label: 'Progress', path: '/progress', icon: BarChart3 },
];
const explore = [
  { label: 'Roleplay', path: '/roleplay', icon: Compass },
  { label: 'Debate', path: '/debate', icon: Sparkles },
  { label: 'AI tutors', path: '/tutors', icon: UserRound },
];

export function Sidebar({ activePath, open, onClose, onNavigate }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose, open]);

  const links = (group: typeof items) => group.map(({ label, path, icon: Icon }) => <button key={path} className={`side-link ${activePath === path ? 'active' : ''}`} onClick={() => { onNavigate(path); onClose(); }}><Icon size={18} /><span>{label}</span>{activePath === path && <span className="active-dot" />}</button>);
  return <><aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation"><div className="sidebar-head"><span className="eyebrow">Your learning space</span><button ref={closeButtonRef} className="mobile-menu icon-button" onClick={onClose} aria-label="Close menu"><X size={19} /></button></div><nav><span className="nav-label">Workspace</span>{links(items)}<span className="nav-label explore-label">Explore</span>{links(explore)}</nav><div className="sidebar-bottom"><button className="side-link" onClick={() => { onNavigate('/assessment'); onClose(); }}><BookOpen size={18} /><span>Retake assessment</span></button><button className="side-link" onClick={() => { onNavigate('/profile'); onClose(); }}><Settings size={18} /><span>Settings</span></button><div className="upgrade-card"><span className="upgrade-icon"><Sparkles size={16} /></span><strong>Make progress<br />feel effortless.</strong><button onClick={() => { onNavigate('/practice'); onClose(); }}>Start a session <span>→</span></button></div></div></aside>{open && <button className="scrim" onClick={onClose} aria-label="Close navigation" />}</>;
}
