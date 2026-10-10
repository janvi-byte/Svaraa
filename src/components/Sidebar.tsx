import { BarChart3, BookOpen, Compass, Headphones, LayoutDashboard, MessageCircle, Settings, Sparkles, WandSparkles, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

type SidebarProps = { activePath: string; open: boolean; onClose: () => void; onNavigate: (path: string) => void };

const items = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Quick Practice', path: '/practice', icon: Headphones },
  { label: 'AI Conversation', path: '/conversation', icon: MessageCircle },
  { label: 'Roleplay Studio', path: '/roleplay', icon: Compass },
  { label: 'Intellectual Debate', path: '/debate', icon: Sparkles },
  { label: 'Presentation Studio', path: '/presentation', icon: WandSparkles },
  { label: 'Progress & Growth', path: '/progress', icon: BarChart3 },
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

  const links = (group: typeof items) =>
    group.map(({ label, path, icon: Icon }) => (
      <button
        key={path}
        className={`side-link ${activePath === path ? 'active' : ''}`}
        onClick={() => {
          onNavigate(path);
          onClose();
        }}
      >
        <Icon size={18} />
        <span>{label}</span>
        {activePath === path && <span className="active-dot" />}
      </button>
    ));

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-head">
          <span className="eyebrow">Speakora Studio</span>
          <button ref={closeButtonRef} className="mobile-menu icon-button" onClick={onClose} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">Practice Modes</span>
          {links(items)}
        </nav>
        <div className="sidebar-bottom">
          <button className="side-link" onClick={() => { onNavigate('/assessment'); onClose(); }}>
            <BookOpen size={18} />
            <span>Retake assessment</span>
          </button>
          <button className="side-link" onClick={() => { onNavigate('/profile'); onClose(); }}>
            <Settings size={18} />
            <span>Profile & Settings</span>
          </button>
        </div>
      </aside>
      {open && <button className="scrim" onClick={onClose} aria-label="Close navigation" />}
    </>
  );
}
