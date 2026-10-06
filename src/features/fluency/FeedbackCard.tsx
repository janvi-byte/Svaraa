import type { ReactNode } from 'react';
import { CheckCircle2, Lightbulb, Volume2 } from 'lucide-react';

type FeedbackCardProps = {
  type: 'good' | 'tip';
  title: string;
  children: ReactNode;
};

export function FeedbackCard({
  type,
  title,
  children,
}: FeedbackCardProps) {
  const good = type === 'good';

  return (
    <div className={`feedback-card ${good ? 'good' : 'tip'}`}>
      <span className="feedback-icon">
        {good ? (
          <CheckCircle2 size={19} />
        ) : (
          <Lightbulb size={19} />
        )}
      </span>

      <div>
        <strong>{title}</strong>
        <div>{children}</div>

        {good && (
          <button className="listen-link">
            <Volume2 size={14} />
            Listen to example
          </button>
        )}
      </div>
    </div>
  );
}