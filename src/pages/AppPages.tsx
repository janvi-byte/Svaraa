import { useEffect, useRef, useState } from 'react';

import type { FormEvent, ReactNode } from 'react';

import {

  ArrowRight,

  Check,

  ChevronRight,

  CircleHelp,
  Eye,
  EyeOff,

  Globe2,

  LockKeyhole,

  Mail,

  Menu,

  Minus,

  Play,

  ShieldCheck,

  Sparkles,

  Target,

  Trophy,

  TrendingDown,

  TrendingUp,

  UserRound,

  Volume2,

  WandSparkles,

  Zap,

} from 'lucide-react';

import {

  AudioRecorder,

  FeedbackCard,

  MiniScore,

  Navbar,

  PageShell,

  ScoreCard,

  Sidebar,

  Timer,

  TutorCard,

} from '@/components';

import { useAuth } from '@/hooks/useAuth';

import { ApiError } from '@/services/api';

import { submitAssessment } from '@/services/assessmentService';

import {

  clearLatestAnalysis,

  clearLatestSession,

  clearLatestTranscription,

  clearRetryContext,

  getLatestAnalysis,

  getLatestSession,

  getLatestTranscription,

  getLatestTopic,

  getRetryContext,

  setLatestSession,

  setLatestTopic,

  setRetryContext,

  submitRecording,

} from '@/services/transcriptionState';

import {
  compareRetryAttempts,
  completePresentation,
  alignReferenceAudio,
  getPronunciationReferences,
  getNextChallenge,
  getPresentationTopics,
  getSpeakingAnalytics,
  getSpeakingHistory,
  getSpeakingProfile,
  startSpeakingSession,
  startPresentation,
  transcribeAudio,
  type AttemptComparisonResponse,
  type PronunciationReference,
  type ReferenceAlignmentResponse,
  type SpeakingAnalytics,
  type SpeakingProfile,
  type SpeakingSession,
  type SpeakingTopic,
} from '@/services/speakingService';

import {
  completeDebate,
  completeConversation,
  completeRoleplay,
  getTutors,
  getProfile,
  sendMessage,
  startConversation,
  type ProfileResponse,
  type Conversation,
} from '@/services/profileService';

type Navigate = (path: string) => void;

const tutors = [

  {

    name: 'Maya',

    role: 'Friendly conversation partner',

    initials: 'M',

    color: 'peach',

    description: 'Warm, encouraging, and always curious about your world.',

  },

  {

    name: 'James',

    role: 'Business English coach',

    initials: 'J',

    color: 'blue',

    description: 'Clear, focused practice for meetings and presentations.',

  },

  {

    name: 'Priya',

    role: 'Debate partner',

    initials: 'P',

    color: 'green',

    description: 'Challenge your ideas and sharpen your reasoning.',

  },

];

function LandingPage({ navigate }: { navigate: Navigate }) {

  return (

    <div className="landing">

      <nav className="landing-nav">

        <button className="brand" onClick={() => navigate('/')}>

          <span className="brand-mark">

            <Sparkles size={17} />

          </span>

          Speakora

        </button>

        <div className="landing-links">

          <a href="#why">Why Speakora</a>

          <a href="#method">How it works</a>

          <a href="#stories">Stories</a>

        </div>

        <div className="landing-actions">

          <button className="text-button" onClick={() => navigate('/login')}>

            Log in

          </button>

          <button

            className="button primary small"

            onClick={() => navigate('/signup')}

          >

            Get started <ArrowRight size={16} />

          </button>

        </div>

        <button className="mobile-menu icon-button">

          <Menu size={20} />

        </button>

      </nav>

      <section className="hero">

        <div className="hero-copy">

          <span className="pill">

            <span className="live-dot" /> Built for brave speakers

          </span>

          <h1>

            Find your voice.

            <br />

            <em>Speak with ease.</em>

          </h1>

          <p>

            Practice real conversations, get thoughtful feedback, and grow into

            the speaker you already are.

          </p>

          <div className="hero-actions">

            <button

              className="button primary"

              onClick={() => navigate('/signup')}

            >

              Start speaking free <ArrowRight size={17} />

            </button>

            <button

              className="play-button"

              onClick={() => navigate('/practice')}

            >

              <span>

                <Play size={14} fill="currentColor" />

              </span>

              See how it works

            </button>

          </div>

          <div className="social-proof">

            <div className="avatar-stack">

              <span className="avatar peach">AL</span>

              <span className="avatar blue">JM</span>

              <span className="avatar green">SK</span>

              <span className="avatar yellow">+4k</span>

            </div>

            <span>

              Loved by <strong>4,000+ learners</strong>

            </span>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-orbit orbit-one" />

          <div className="hero-orbit orbit-two" />

          <div className="hero-note note-top">

            <span className="note-icon teal-bg">

              <Volume2 size={15} />

            </span>

            <div>

              <strong>Nice pacing</strong>

              <small>You're sounding natural</small>

            </div>

          </div>

          <div className="hero-person">

            <div className="person-glow" />

            <div className="person-head">AR</div>

            <div className="person-body" />

            <div className="person-badge">

              <span className="live-dot" /> Speaking now

            </div>

          </div>

          <div className="hero-note note-bottom">

            <span className="note-icon coral-bg">

              <Target size={15} />

            </span>

            <div>

              <strong>Small steps</strong>

              <small>Lead to big confidence</small>

            </div>

          </div>

        </div>

        <div className="scribble">

          your voice

          <br />

          <span>matters</span> ↗

        </div>

      </section>

      <section className="marquee">

        <span>Speak clearly</span>

        <i />

        <span>Think confidently</span>

        <i />

        <span>Be understood</span>

        <i />

        <span>Find your voice</span>

        <i />

      </section>

      <section className="landing-benefits" id="why">

        <div>

          <span className="eyebrow">A better way to practice</span>

          <h2>

            Less pressure.

            <br />

            <em>More progress.</em>

          </h2>

        </div>

        <p>

          Speakora makes speaking practice feel less like a test and more like

          a conversation with someone in your corner.

        </p>

        <div className="benefit-grid">

          <article>

            <span className="benefit-icon yellow-bg">

              <WandSparkles size={19} />

            </span>

            <h3>Made for your pace</h3>

            <p>

              Adaptive challenges meet you right where you are and grow with

              you.

            </p>

          </article>

          <article>

            <span className="benefit-icon teal-bg">

              <ShieldCheck size={19} />

            </span>

            <h3>Feedback that helps</h3>

            <p>

              Specific, kind guidance you can use in your very next sentence.

            </p>

          </article>

          <article>

            <span className="benefit-icon coral-bg">

              <Zap size={19} />

            </span>

            <h3>Progress you can feel</h3>

            <p>

              See the small wins add up as hesitation turns into momentum.

            </p>

          </article>

        </div>

      </section>

      <section className="landing-cta">

        <div>

          <span className="eyebrow">Your next chapter starts here</span>

          <h2>

            Ready to hear

            <br />

            <em>yourself shine?</em>

          </h2>

        </div>

        <button

          className="button dark"

          onClick={() => navigate('/signup')}

        >

          Create your free account <ArrowRight size={17} />

        </button>

      </section>

      <footer className="landing-footer">

        <button className="brand" onClick={() => navigate('/')}>

          <span className="brand-mark">

            <Sparkles size={17} />

          </span>

          Speakora

        </button>

        <span>Speak. Improve. Speak with confidence.</span>

        <span>© 2024 Speakora</span>

      </footer>

    </div>

  );

}

function Dashboard({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);

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
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadProfile() {
      try {
        const response = await getProfile();
        if (mounted) {
          setProfileData(response);
        }
      } catch {
        // Profile is optional on the dashboard
      }
    }

    loadHistory();
    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const analyzedSessions = sessions.filter(
    (session) =>
      session.status === 'analyzed' &&
      session.analysis?.status === 'complete'
  );

  const getDateKey = (value?: string) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const today = new Date();

  const todayKey = getDateKey(today.toISOString());

  const practiceDates = new Set(
    analyzedSessions
      .map((session) => getDateKey(session.createdAt))
      .filter(Boolean)
  );

  let streak = 0;
  const streakDate = new Date(today);

  while (practiceDates.has(getDateKey(streakDate.toISOString()))) {
    streak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  const monday = new Date(today);
  const dayOfWeek = monday.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      key: getDateKey(date.toISOString()),
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index],
    };
  });

  const metricValues = analyzedSessions.length
    ? [
        {
          name: 'Grammar',
          value: analyzedSessions.reduce(
            (sum, session) => sum + (session.analysis?.grammar || 0),
            0
          ) / analyzedSessions.length,
        },
        {
          name: 'Fluency',
          value: analyzedSessions.reduce(
            (sum, session) => sum + (session.analysis?.fluency || 0),
            0
          ) / analyzedSessions.length,
        },
        {
          name: 'Vocabulary',
          value: analyzedSessions.reduce(
            (sum, session) => sum + (session.analysis?.vocabulary || 0),
            0
          ) / analyzedSessions.length,
        },
        {
          name: 'Pacing',
          value: analyzedSessions.reduce(
            (sum, session) => sum + (session.analysis?.pacing || 0),
            0
          ) / analyzedSessions.length,
        },
      ]
    : [];

  const focus = metricValues.length
    ? metricValues.reduce((weakest, current) =>
        current.value < weakest.value ? current : weakest
      )
    : {
        name: 'Your speaking',
        value: 0,
      };

  const focusScore = Math.round(focus.value);

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || 'there';

  const todayLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const focusMessage =
    analyzedSessions.length === 0
      ? 'Complete your first practice to discover your focus area.'
      : focusScore < 60
        ? 'This is your biggest opportunity to improve.'
        : focusScore < 80
          ? 'This is the area to work on next.'
          : 'You are building a strong foundation here.';

  return (
    <PageShell
      eyebrow={todayLabel}
      title={
        <>
          Good morning, <em>{firstName}.</em>
        </>
      }
      description="A little practice today goes a long way."
    >
      <div className="dashboard-grid">
        <section className="welcome-card">
          <div>
            <span className="pill light">
              <Sparkles size={13} /> Your next best step
            </span>

            <h2>
              Ready for a
              <br />
              <em>quick win?</em>
            </h2>

            <p>
              {profileData?.nextChallenge ||
                'A 2-minute speaking challenge designed around your progress.'}
            </p>

            <button
              className="button dark"
              onClick={() => navigate('/practice')}
            >
              Start today's practice <ArrowRight size={16} />
            </button>
          </div>

          <div className="welcome-illustration">
            <div className="sun" />
            <div className="hill hill-a" />
            <div className="hill hill-b" />
            <span className="illustration-word">go for it</span>
          </div>
        </section>

        <section className="streak-card">
          <div className="streak-header">
            <span className="eyebrow">Current streak</span>
            <span className="streak-fire">✦</span>
          </div>

          <strong>
            {loading ? '—' : streak} <small>days</small>
          </strong>

          <p>
            {streak > 0
              ? "You're building a beautiful habit."
              : 'Start practicing to build your streak.'}
          </p>

          <div className="week-dots">
            {weekDays.map((day) => {
              const practiced = practiceDates.has(day.key);
              const isToday = day.key === todayKey;

              return (
                <span
                  key={day.key}
                  className={
                    practiced ? 'done' : isToday ? 'today' : ''
                  }
                >
                  {practiced ? <Check size={12} /> : day.label}
                </span>
              );
            })}
          </div>
        </section>

        <section className="focus-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your focus</span>
              <h2>{loading ? 'Loading…' : focus.name}</h2>
            </div>

            <span className="focus-score">
              {loading ? '—' : `${focusScore}%`}
            </span>
          </div>

          <div className="focus-bar">
            <span
              style={{
                width: `${loading ? 0 : focusScore}%`,
              }}
            />
          </div>

          <p>
            <strong>
              {analyzedSessions.length
                ? focusScore >= 80
                  ? 'Looking good.'
                  : 'Room to grow.'
                : 'No score yet.'}
            </strong>{' '}
            {focusMessage}
          </p>

          <button
            className="text-link"
            onClick={() => navigate('/progress')}
          >
            View progress <ArrowRight size={14} />
          </button>
        </section>

        {profileData && profileData.profile.sessionsAnalyzed > 0 && (
          <section className="speaking-profile-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Speaking profile</span>
                <h2>Your skills snapshot</h2>
              </div>
              <span className="profile-sessions">
                {profileData.profile.sessionsAnalyzed} sessions
              </span>
            </div>

            <div className="profile-skills-grid">
              <div className="profile-skill-item">
                <span className="profile-skill-label">Strongest</span>
                <strong className="profile-skill-value">
                  {profileData.profile.strongestSkill || '—'}
                </strong>
              </div>
              <div className="profile-skill-item">
                <span className="profile-skill-label">Needs attention</span>
                <strong className="profile-skill-value">
                  {profileData.profile.weakestSkill || '—'}
                </strong>
              </div>
              <div className="profile-skill-item">
                <span className="profile-skill-label">Improving</span>
                <strong className="profile-skill-value">
                  {profileData.profile.improvingSkill || '—'}
                </strong>
              </div>
              <div className="profile-skill-item">
                <span className="profile-skill-label">Trend</span>
                <strong className="profile-skill-value">
                  {profileData.profile.recentScoreTrend || '—'}
                </strong>
              </div>
            </div>

            <div className="profile-scores-bar">
              {[
                { label: 'Grammar', value: profileData.profile.avgGrammar },
                { label: 'Fluency', value: profileData.profile.avgFluency },
                { label: 'Vocabulary', value: profileData.profile.avgVocabulary },
                { label: 'Pacing', value: profileData.profile.avgPacing },
              ].map((skill) => (
                <div key={skill.label} className="profile-score-mini">
                  <span className="profile-score-label">{skill.label}</span>
                  <span className="profile-score-number">{skill.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="dashboard-practice">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Pick your moment</span>
              <h2>Ways to practice</h2>
            </div>

            <button
              className="text-link"
              onClick={() => navigate('/practice')}
            >
              See all <ArrowRight size={14} />
            </button>
          </div>

          <div className="practice-cards">
            <button onClick={() => navigate('/practice')}>
              <span className="practice-icon teal-bg">
                <MicIcon />
              </span>
              <strong>Quick practice</strong>
              <small>1–2 minutes · Get warmed up</small>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate('/conversation')}>
              <span className="practice-icon coral-bg">
                <MessageIcon />
              </span>
              <strong>Open conversation</strong>
              <small>Go with the flow · No script</small>
              <ArrowRight size={16} />
            </button>

            <button onClick={() => navigate('/roleplay')}>
              <span className="practice-icon yellow-bg">
                <UsersIcon />
              </span>
              <strong>Try a roleplay</strong>
              <small>Real-world situations</small>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function MicIcon() {

  return <Volume2 size={20} />;

}

function MessageIcon({ size = 20 }: { size?: number }) {

  return <MessageCircleIcon size={size} />;

}

function UsersIcon() {

  return <UserRound size={20} />;

}

function MessageCircleIcon({ size = 20 }: { size?: number }) {

  return <CircleHelp size={size} />;

}

function PracticePage({ navigate }: { navigate: Navigate }) {
  const [topic, setTopic] = useState<SpeakingTopic | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [error, setError] = useState('');
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState('');
  const startedRef = useRef(false);

  async function loadPracticeTopic(excludeTopicId?: string) {
    setError('');

    if (excludeTopicId) {
      setLoadingTopic(true);
    } else {
      setLoading(true);
    }

    try {
      clearLatestSession();
      clearLatestTranscription();
      clearLatestAnalysis();

      const retryContext = excludeTopicId
        ? null
        : getRetryContext();

      if (retryContext) {
        clearRetryContext();

        const { session } = await startSpeakingSession(
          retryContext.topic._id,
          retryContext.retryGroup
        );

        setTopic(retryContext.topic);
        setLatestTopic(retryContext.topic);
        setLatestSession(session);
        setAudioBlob(null);
        setDuration(0);
        setIsRetryAttempt(true);
        return;
      }

      const challenge = await getNextChallenge(excludeTopicId);

      const { session } =
        await startSpeakingSession(challenge.topic._id);

      setTopic(challenge.topic);
      setLatestTopic(challenge.topic);
      setLatestSession(session);
      setAudioBlob(null);
      setDuration(0);
      setIsRetryAttempt(false);
      setChallengeMessage(
        challenge.personalized && challenge.focus
          ? challenge.focus.message
          : ''
      );
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load a speaking topic. Please try again.'
      );
    } finally {
      setLoading(false);
      setLoadingTopic(false);
    }
  }

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    loadPracticeTopic();
  }, []);

  const handleRecordingComplete = (
    blob: Blob,
    durationSeconds: number
  ) => {
    setAudioBlob(blob);
    setDuration(durationSeconds);
    setError('');
  };

  const handleFinish = async () => {
    if (!audioBlob) {
      setError('Please record your response first.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitRecording(audioBlob, duration);
      navigate('/results');
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to analyze your recording. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTopic = async () => {
    if (!topic?._id || loadingTopic || submitting) {
      return;
    }

    await loadPracticeTopic(topic._id);
  };

  const durationLabel = topic?.durationSeconds
    ? `${Math.floor(topic.durationSeconds / 60)} minute${
        topic.durationSeconds >= 120 ? 's' : ''
      }`
    : '1 minute';

  const timerValue = topic?.durationSeconds
    ? `${String(
        Math.floor(topic.durationSeconds / 60)
      ).padStart(2, '0')}:00`
    : '01:00';

  if (loading) {
    return (
      <PageShell
        eyebrow="Speaking practice"
        title={
          <>
            Finding your
            <br />
            <em>next prompt.</em>
          </>
        }
        description="Preparing a fresh speaking challenge for you."
        back={() => navigate('/dashboard')}
      >
        <section className="feedback-section">
          <span className="eyebrow">Loading topic…</span>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Speaking practice"
      title={
        <>
          Say it like
          <br />
          <em>you mean it.</em>
        </>
      }
      description="A short, low-pressure prompt to keep your momentum going."
      back={() => navigate('/dashboard')}
      action={<Timer value={timerValue} />}
    >
      <div className="practice-layout">
        <section className="prompt-card">
          <div className="prompt-top">
            <span className="pill light">
              {isRetryAttempt ? 'Retry attempt' : "Today's prompt"}
            </span>

            <span className="difficulty">
              <span />
              {topic?.difficulty || 'Easy'}
            </span>
          </div>

          <h2>
            {topic?.title || 'Your speaking prompt'}
          </h2>

          <p>
            {topic?.prompt ||
              'Take a moment to think, then speak naturally.'}
          </p>

          <div className="prompt-tags">
            <span>{topic?.category || 'General'}</span>
            <span>{durationLabel}</span>
          </div>

          {challengeMessage && (
            <div className="prompt-note">
              <span className="eyebrow">Your next challenge</span>
              <p>{challengeMessage}</p>
            </div>
          )}

          <button
            className="text-link"
            onClick={handleNewTopic}
            disabled={loadingTopic || submitting}
            style={{ marginTop: '20px' }}
          >
            {loadingTopic ? 'Finding another topic…' : 'Try another topic'}
            {!loadingTopic && <ArrowRight size={14} />}
          </button>

          <button
            className="text-link"
            onClick={() => navigate('/pronunciation-practice')}
            style={{ marginTop: '12px' }}
          >
            Read aloud practice <ArrowRight size={14} />
          </button>
        </section>

        <section className="record-section">
          <div className="record-title">
            <div>
              <span className="eyebrow">Your turn</span>
              <h2>Take a breath, then begin.</h2>
            </div>

            <span className="record-status">
              <span className="live-dot" />
              {audioBlob ? 'Recording ready' : 'Ready'}
            </span>
          </div>

          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
          />

          {error && (
            <p
              className="auth-error"
              role="alert"
              style={{
                textAlign: 'center',
                marginTop: '16px',
              }}
            >
              {error}
            </p>
          )}

          <div className="record-footer">
            <span>
              <ShieldCheck size={15} />
              Your recording stays private
            </span>

            <button
              className="button primary"
              onClick={handleFinish}
              disabled={
                loading ||
                loadingTopic ||
                submitting ||
                !topic ||
                !audioBlob
              }
            >
              {submitting ? 'Analyzing…' : 'Finish practice'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function ReferencePracticePage({ navigate }: { navigate: Navigate }) {
  const [references, setReferences] = useState<PronunciationReference[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [result, setResult] =
    useState<ReferenceAlignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPronunciationReferences()
      .then(({ references: loadedReferences }) => {
        setReferences(loadedReferences);
        setSelectedId(loadedReferences[0]?.id || '');
      })
      .catch((requestError) => {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to load read aloud exercises.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedReference = references.find(
    (reference) => reference.id === selectedId
  );

  const handleSubmit = async () => {
    if (!audioBlob || !selectedId) {
      setError('Choose a sentence and record it before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const alignment = await alignReferenceAudio(
        audioBlob,
        selectedId,
        duration
      );
      setResult(alignment);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to align this recording. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell
        eyebrow="Read aloud practice"
        title={<>Choose a sentence to<br /><em>practice.</em></>}
        description="Loading reference sentences."
        back={() => navigate('/practice')}
      >
        <section className="feedback-section">
          <span className="eyebrow">Loading exercises…</span>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Read aloud practice"
      title={<>Speak with<br /><em>the reference.</em></>}
      description="Read one sentence naturally. The result shows how the audio aligned to the words Whisper recognized."
      back={() => navigate('/practice')}
    >
      <div className="practice-layout">
        <section className="prompt-card">
          <div className="prompt-top">
            <span className="pill light">Reference sentence</span>
            <span className="difficulty">
              <span />
              {selectedReference?.difficulty || 'Easy'}
            </span>
          </div>

          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setAudioBlob(null);
              setResult(null);
              setError('');
            }}
            aria-label="Choose a reference sentence"
            style={{ width: '100%', marginBottom: '18px' }}
          >
            {references.map((reference) => (
              <option key={reference.id} value={reference.id}>
                {reference.text}
              </option>
            ))}
          </select>

          <h2>{selectedReference?.text || 'No reference sentence available.'}</h2>
          <div className="prompt-tags">
            <span>{selectedReference?.category || 'Practice'}</span>
            <span>Read aloud</span>
          </div>
        </section>

        <section className="record-section">
          <div className="record-title">
            <div>
              <span className="eyebrow">Your turn</span>
              <h2>Read the sentence naturally.</h2>
            </div>
            <span className="record-status">
              <span className="live-dot" />
              {audioBlob ? 'Recording ready' : 'Ready'}
            </span>
          </div>

          <AudioRecorder
            onRecordingComplete={(blob, seconds) => {
              setAudioBlob(blob);
              setDuration(seconds);
              setResult(null);
              setError('');
            }}
          />

          {error && (
            <p className="auth-error" role="alert" style={{ textAlign: 'center', marginTop: '16px' }}>
              {error}
            </p>
          )}

          <div className="record-footer">
            <span>
              <ShieldCheck size={15} />
              Your recording stays private
            </span>
            <button
              className="button primary"
              onClick={handleSubmit}
              disabled={submitting || !audioBlob || !selectedReference}
            >
              {submitting ? 'Aligning…' : 'Check timing'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </div>
        </section>
      </div>

      {result && (
        <section className="feedback-section" style={{ marginTop: '24px' }}>
          <span className="eyebrow">Alignment evidence</span>
          <h2>What Whisper recognized</h2>
          <p><strong>Reference:</strong> {result.reference.text}</p>
          <p><strong>Recognized:</strong> {result.transcript}</p>
          <p style={{ marginTop: '14px' }}>
            These timings show how the audio aligned to the recognized words.
            They are not a pronunciation accuracy score.
          </p>

          {result.comparison && (
            <div className="prompt-tags" style={{ marginTop: '14px' }}>
              <span>
                {result.comparison.recognizedTextMatchesReference
                  ? 'Recognized text matches'
                  : 'Recognized text differs'}
              </span>
              {result.comparison.missingWords.length > 0 && (
                <span>Missing: {result.comparison.missingWords.join(', ')}</span>
              )}
              {result.comparison.extraWords.length > 0 && (
                <span>Extra: {result.comparison.extraWords.join(', ')}</span>
              )}
            </div>
          )}

          {result.words && result.words.length > 0 && (
            <div className="prompt-tags" style={{ marginTop: '14px' }}>
              {result.words.map((word, index) => (
                <span key={`${word.word}-${index}`}>
                  {word.word} {word.start.toFixed(2)}–{word.end.toFixed(2)}s
                </span>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}

function ResultsPage({ navigate }: { navigate: Navigate }) {
  const transcription = getLatestTranscription();
  const analysis = getLatestAnalysis();
  const [attemptComparison, setAttemptComparison] =
    useState<AttemptComparisonResponse | null>(null);

  const retryGroup = getLatestSession()?.retryGroup;

  useEffect(() => {
    if (!retryGroup) {
      return;
    }

    let mounted = true;

    compareRetryAttempts(retryGroup)
      .then((response) => {
        if (mounted) {
          setAttemptComparison(response);
        }
      })
      .catch(() => {
        // Attempt comparison is optional; the scores above still apply.
      });

    return () => {
      mounted = false;
    };
  }, [retryGroup]);

  if (!transcription || !analysis) {
    return (
      <PageShell
        eyebrow="Practice results"
        title={
          <>
            No results
            <br />
            <em>yet.</em>
          </>
        }
        description="Complete a speaking practice session to see your analysis."
        back={() => navigate('/practice')}
      >
        <section className="feedback-section">
          <button
            className="button primary"
            onClick={() => navigate('/practice')}
          >
            Start practice <ArrowRight size={16} />
          </button>
        </section>
      </PageShell>
    );
  }

  const grammarErrors = analysis.grammar_errors || [];
  const vocabularyUpgrades = analysis.vocabulary_upgrades || [];

  const topGrammarErrors = grammarErrors.slice(0, 3);
  const topVocabularyUpgrades = vocabularyUpgrades.slice(0, 3);

  const improvedAnswer =analysis.improved_answer?.trim() ||transcription.transcript;


  const scoreLabel =
    analysis.overall >= 85
      ? 'Strong foundation'
      : analysis.overall >= 70
        ? 'Good progress'
        : analysis.overall >= 50
          ? 'Needs practice'
          : 'Focus on the basics';

  const handleTryAgain = () => {
    const topic = getLatestTopic();
    const session = getLatestSession();

    if (topic && session?.retryGroup) {
      setRetryContext({
        topic,
        retryGroup: session.retryGroup,
      });
    }

    navigate('/practice');
  };

  const comparisonMetrics = attemptComparison?.comparison ?? [];
  const firstAttempt = attemptComparison?.firstAttempt;
  const latestAttempt = attemptComparison?.latestAttempt;
  const overallTrend = attemptComparison?.overallTrend;
  const showComparison =
    comparisonMetrics.length > 0 &&
    firstAttempt != null &&
    latestAttempt != null;

  return (
    <PageShell
      eyebrow="Practice complete"
      title={
        <>
          Turn mistakes into
          <br />
          <em>better speaking.</em>
        </>
      }
      description="Here are the changes that will make your next answer clearer and more natural."
      back={() => navigate('/practice')}
    >
      <div className="results-grid">

        <section className="results-score">
          <span className="eyebrow">Overall speaking score</span>

          <div className="big-score">
            {analysis.overall}
            <span>/100</span>
          </div>

          <div className="score-ring">
            <span>
              {scoreLabel}
              <br />
              <em>keep going.</em>
            </span>
          </div>
        </section>

        <section className="results-breakdown">
          <div className="section-heading">
            <div>
              <span className="eyebrow">The details</span>
              <h2>Your speaking profile</h2>
            </div>

            <button
              className="text-link"
              onClick={() => navigate('/progress')}
            >
              See all progress <ArrowRight size={14} />
            </button>
          </div>

          <div className="score-list">
            <ScoreCard
              label="Fluency"
              value={String(analysis.fluency)}
              change=""
              tone="teal"
            />

            <ScoreCard
              label="Vocabulary"
              value={String(analysis.vocabulary)}
              change=""
              tone="coral"
            />

            <ScoreCard
              label="Grammar"
              value={String(analysis.grammar)}
              change=""
              tone="yellow"
            />

            <ScoreCard
              label="Pacing"
              value={String(analysis.pacing)}
              change=""
              tone="blue"
            />
          </div>
        </section>

        <section className="feedback-section improved-answer-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Most important</span>
              <h2>Your answer, improved</h2>
            </div>

            <button
              className="button outline"
              onClick={handleTryAgain}
            >
              Try again <ArrowRight size={15} />
            </button>
          </div>

          <div className="improved-answer-card">
            <div className="answer-block">
              <span className="answer-label">You said</span>
              <p>{transcription.transcript}</p>
            </div>

            <div className="answer-divider" />

            <div className="answer-block improved">
              <span className="answer-label">A more natural way to say it</span>
              <p>{improvedAnswer}</p>
            </div>
          </div>
        </section>

        {showComparison && firstAttempt && latestAttempt && (
          <section className="feedback-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Attempt comparison</span>
                <h2>
                  Attempt {firstAttempt.attemptNumber} vs attempt{' '}
                  {latestAttempt.attemptNumber}
                </h2>
              </div>

              <span className="pill light">
                {overallTrend === 'improved' && <TrendingUp size={13} />}
                {overallTrend === 'declined' && <TrendingDown size={13} />}
                {overallTrend === 'unchanged' && <Minus size={13} />}
                {overallTrend === 'improved'
                  ? 'Overall improved'
                  : overallTrend === 'declined'
                    ? 'Overall declined'
                    : 'Overall unchanged'}
              </span>
            </div>

            <div className="score-list">
              {comparisonMetrics.map((metric, index) => (
                <div
                  className={`score-card ${
                    ['teal', 'coral', 'yellow', 'blue'][index % 4]
                  }`}
                  key={metric.key}
                >
                  <div className="score-card-top">
                    <span className="score-label">{metric.label}</span>

                    {metric.trend === 'improved' && <TrendingUp size={13} />}
                    {metric.trend === 'declined' && (
                      <TrendingDown size={13} />
                    )}
                    {metric.trend === 'unchanged' && <Minus size={13} />}
                  </div>

                  <strong>
                    {metric.first} <ArrowRight size={13} /> {metric.latest}
                  </strong>

                  <span
                    className="score-change"
                    style={
                      metric.trend === 'declined'
                        ? { color: 'var(--coral)' }
                        : metric.trend === 'unchanged'
                          ? { color: 'var(--muted)' }
                          : undefined
                    }
                  >
                    {metric.delta > 0 ? `+${metric.delta}` : metric.delta}
                    {' · '}
                    {metric.trend === 'improved'
                      ? 'Improved'
                      : metric.trend === 'declined'
                        ? 'Declined'
                        : 'Unchanged'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="feedback-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Grammar coach</span>
              <h2>Fix these first</h2>
            </div>
          </div>

          {topGrammarErrors.length === 0 ? (
            <FeedbackCard
              type="good"
              title="No major grammar issues detected"
            >
              Your response was grammatically consistent with the patterns Speakora currently checks.
            </FeedbackCard>
          ) : (
            <div className="correction-list">
              {topGrammarErrors.map((error, index) => (
                <div
                  className="correction-item"
                  key={`grammar-${index}`}
                >
                  <div className="correction-number">
                    {index + 1}
                  </div>

                  <div className="correction-content">
                    <span className="correction-category">
                      {error.category}
                    </span>

                    <div className="correction-row">
                      <span className="wrong-text">
                        {error.original}
                      </span>

                      <ArrowRight size={16} />

                      <span className="right-text">
                        {error.correction}
                      </span>
                    </div>

                    <p>{error.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="feedback-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vocabulary coach</span>
              <h2>Upgrade your words</h2>
            </div>
          </div>

          {topVocabularyUpgrades.length === 0 ? (
            <FeedbackCard
              type="good"
              title="Your vocabulary worked well here"
            >
              No obvious vocabulary upgrades were identified.
            </FeedbackCard>
          ) : (
            <div className="vocabulary-list">
              {topVocabularyUpgrades.map((item, index) => (
                <div
                  className="vocabulary-item"
                  key={`vocabulary-${index}`}
                >
                  <div>
                    <span className="answer-label">
                      You used
                    </span>

                    <strong>{item.usedWord}</strong>
                  </div>

                  <ArrowRight size={18} />

                  <div>
                    <span className="answer-label">
                      Try
                    </span>

                    <strong>{item.suggestedWord}</strong>
                  </div>

                  <div className="vocabulary-meaning">
                    <span>
                      {item.meaning}
                    </span>

                    <small>
                      {item.preferredLanguage}: {item.translation}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="feedback-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vocabulary tracking</span>
              <h2>Words from this session</h2>
            </div>
          </div>

          {analysis.vocabularySummary ? (
            <div className="vocabulary-list">
              <div className="vocabulary-item">
                <div>
                  <span className="answer-label">New words</span>
                  <strong>
                    {analysis.vocabularySummary.newWords.length > 0
                      ? analysis.vocabularySummary.newWords.join(', ')
                      : 'No new words in this session.'}
                  </strong>
                </div>
              </div>

              <div className="vocabulary-item">
                <div>
                  <span className="answer-label">Previously used words</span>
                  <strong>
                    {analysis.vocabularySummary.previouslyUsedWords.length > 0
                      ? analysis.vocabularySummary.previouslyUsedWords.join(', ')
                      : 'No previously used words.'}
                  </strong>
                </div>
              </div>

              <div className="vocabulary-item">
                <div>
                  <span className="answer-label">Repeated content words</span>
                  <strong>
                    {analysis.vocabularySummary.repeatedWords.length > 0
                      ? analysis.vocabularySummary.repeatedWords
                          .map((item) => `${item.word} × ${item.count}`)
                          .join(', ')
                      : 'No repeated content words.'}
                  </strong>
                </div>
              </div>

              <div className="vocabulary-item">
                <div>
                  <span className="answer-label">Content vocabulary diversity</span>
                  <strong>
                    {analysis.vocabularySummary.contentVocabularyDiversity}%
                  </strong>
                  <span className="vocabulary-meaning">
                    {analysis.vocabularySummary.contentWordCount} content words
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <FeedbackCard
              type="good"
              title="Vocabulary tracking unavailable for this session."
            >
              Older sessions may not include the vocabulary tracking summary.
            </FeedbackCard>
          )}
        </section>

        <section className="results-breakdown">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Speaking habits</span>
              <h2>What we noticed</h2>
            </div>
          </div>

          <div className="score-list">
            <ScoreCard
              label="Words per minute"
              value={String(analysis.words_per_minute)}
              change=""
              tone="blue"
            />

            <ScoreCard
              label="Filler words"
              value={String(analysis.filler_count)}
              change=""
              tone="yellow"
            />

            <ScoreCard
              label="Vocabulary variety"
              value={`${analysis.vocabulary_diversity}%`}
              change=""
              tone="teal"
            />

            <ScoreCard
              label="Repeated phrases"
              value={String(analysis.repeated_phrase_count)}
              change=""
              tone="coral"
            />
          </div>
        </section>

        <section className="transcript-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What you said</span>
              <h2>Original transcript</h2>
            </div>

            <span className="record-time">
              {transcription.duration_seconds > 0
                ? `${Math.floor(
                    transcription.duration_seconds / 60
                  )}:${String(
                    Math.floor(
                      transcription.duration_seconds % 60
                    )
                  ).padStart(2, '0')}`
                : ''}
            </span>
          </div>

          <p className="transcript-text">
            {transcription.transcript}
          </p>
        </section>

      </div>
    </PageShell>
  );
}


function ProgressPage({ navigate }: { navigate: Navigate }) {
  const [analytics, setAnalytics] = useState<SpeakingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        const response = await getSpeakingAnalytics();

        if (mounted) {
          setAnalytics(response);
        }
      } catch {
        if (mounted) {
          setAnalytics(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const totalMinutes = Math.round(seconds / 60);

    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes === 0
      ? `${hours}h`
      : `${hours}h ${minutes}m`;
  };

  const summary = analytics?.summary;
  const hasHistory = Boolean(summary?.sessionsAnalyzed);
  const dateLabel = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  const pointLabel = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  const TrendChart = ({
    title,
    points,
    unit = '',
    lowerIsBetter = false,
  }: {
    title: string;
    points: SpeakingAnalytics['timeSeries'][keyof SpeakingAnalytics['timeSeries']];
    unit?: string;
    lowerIsBetter?: boolean;
  }) => {
    const recentPoints = points.slice(-12);
    const max = Math.max(...recentPoints.map((point) => point.value), 1);

    return (
      <section className="chart-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Trend</span>
            <h2>{title}</h2>
          </div>
          {lowerIsBetter && (
            <span className="eyebrow">Lower is better</span>
          )}
        </div>

        {!recentPoints.length ? (
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
            Not enough speaking history yet.
          </p>
        ) : (
          <div className="bars">
            {recentPoints.map((point) => (
              <div className="bar-col" key={`${title}-${point.sessionId}`}>
                <span className="bar-value">
                  {Math.round(point.value)}{unit}
                </span>
                <div
                  className="bar"
                  style={{ height: `${Math.max(6, (point.value / max) * 100)}%` }}
                />
                <small>{pointLabel(point.date)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <PageShell
      eyebrow="Your journey"
      title={
        <>
          Small steps,
          <br />
          <em>real change.</em>
        </>
      }
      description="Look how far your voice has come."
      back={() => navigate('/dashboard')}
    >
      <div className="progress-grid">
        <section className="progress-summary">
          <div className="progress-big">
            <span className="eyebrow">Analytics overview</span>
            <strong>{loading ? '—' : summary?.sessionsAnalyzed || 0}</strong>
            <span>analyzed speaking sessions</span>
          </div>

          <div className="progress-stat-row">
            <MiniScore
              label="Speaking time"
              value={loading ? '—' : formatDuration(summary?.totalSpeakingTimeSeconds || 0)}
              detail="analyzed sessions"
            />

            <MiniScore
              label="Average score"
              value={loading ? '—' : String(Math.round(summary?.averageOverall || 0))}
              detail="overall"
            />

            <MiniScore
              label="Best score"
              value={loading ? '—' : String(Math.round(summary?.bestOverall || 0))}
              detail="overall"
            />

            <MiniScore
              label="Latest score"
              value={loading ? '—' : String(Math.round(summary?.latestOverall || 0))}
              detail="overall"
            />
          </div>
        </section>

        <TrendChart
          title="Overall score"
          points={analytics?.timeSeries.overall || []}
        />

        <section className="chart-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Skills</span>
              <h2>Skill trends</h2>
            </div>
          </div>
          <div className="progress-stat-row">
            {(['grammar', 'fluency', 'vocabulary', 'pacing'] as const).map(
              (skill) => (
                <MiniScore
                  key={skill}
                  label={skill}
                  value={hasHistory ? 'View below' : '—'}
                  detail="session trend"
                />
              )
            )}
          </div>
        </section>

        <div className="progress-grid">
          <TrendChart
            title="Grammar"
            points={analytics?.timeSeries.grammar || []}
          />
          <TrendChart
            title="Fluency"
            points={analytics?.timeSeries.fluency || []}
          />
          <TrendChart
            title="Vocabulary"
            points={analytics?.timeSeries.vocabulary || []}
          />
          <TrendChart
            title="Pacing"
            points={analytics?.timeSeries.pacing || []}
          />
          <TrendChart
            title="Words per minute"
            points={analytics?.timeSeries.wordsPerMinute || []}
          />
          <TrendChart
            title="Filler count"
            points={analytics?.timeSeries.fillerCount || []}
            lowerIsBetter
          />
          <TrendChart
            title="Repeated phrases"
            points={analytics?.timeSeries.repeatedPhraseCount || []}
            lowerIsBetter
          />
          <TrendChart
            title="Vocabulary diversity"
            points={analytics?.timeSeries.vocabularyDiversity || []}
          />
          <TrendChart
            title="Speaking duration"
            points={analytics?.timeSeries.durationSeconds || []}
            unit="s"
          />
        </div>

        <section className="progress-summary">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Current strengths</span>
              <h2>What to focus on next</h2>
            </div>
          </div>
          {!hasHistory ? (
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Complete an analyzed practice to see your strengths.
            </p>
          ) : (
            <div className="progress-stat-row">
              <MiniScore
                label="Strongest skill"
                value={summary?.strongestSkill || '—'}
                detail="from your speaking profile"
              />
              <MiniScore
                label="Weakest skill"
                value={summary?.weakestSkill || '—'}
                detail="from your speaking profile"
              />
            </div>
          )}
        </section>

        <section className="milestones">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Keep going</span>
              <h2>Milestones</h2>
            </div>

            <Trophy size={20} />
          </div>

          {loading ? (
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                paddingTop: '20px',
              }}
            >
              Loading your milestones...
            </p>
          ) : !analytics?.milestones.length ? (
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                paddingTop: '20px',
              }}
            >
              Your milestones will appear here after analyzed practices.
            </p>
          ) : (
            analytics.milestones.map((milestone) => (
              <div className="milestone" key={milestone.type}>
                <span
                  className="milestone-icon yellow-bg"
                >
                  <Trophy size={17} />
                </span>

                <div>
                  <strong>{milestone.title}</strong>
                  <p>{milestone.description}</p>
                </div>

                <small>{dateLabel(milestone.date)}</small>
              </div>
            ))
          )}
        </section>

        <section className="milestones">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Recent performance</span>
              <h2>Latest analyzed sessions</h2>
            </div>
          </div>
          {!analytics?.recentSessions.length ? (
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Complete an analyzed practice to see recent performance.
            </p>
          ) : (
            analytics.recentSessions.map((session) => (
              <div className="milestone" key={session.sessionId}>
                <div>
                  <strong>
                    {session.topic?.title || 'Speaking practice'}
                    {session.retryGroup ? ' · Retry' : ''}
                  </strong>
                  <p>
                    {dateLabel(session.date)} · {formatDuration(session.durationSeconds)}
                    {' · '}score {Math.round(session.overall)}
                  </p>
                </div>
                <small>{session.topic?.category || 'Analyzed'}</small>
              </div>
            ))
          )}
        </section>
      </div>
    </PageShell>
  );
}

function ConversationPage({ navigate }: { navigate: Navigate }) {
  const [availableTutors, setAvailableTutors] = useState<
    { name: string; style: string }[]
  >([]);
  const [selectedTutor, setSelectedTutor] = useState('Maya');
  const [topic, setTopic] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<
    Awaited<ReturnType<typeof completeConversation>>['analysis'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTutors()
      .then((response) => {
        setAvailableTutors(response.tutors);
        if (response.tutors[0]?.name) {
          setSelectedTutor(response.tutors[0].name);
        }
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load conversation partners.'
        );
      });
  }, []);

  const startOpenConversation = async () => {
    if (!selectedTutor) {
      setError('Choose a conversation partner before starting.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await startConversation({
        tutor: selectedTutor,
        mode: 'conversation',
        ...(topic.trim() ? { topic: topic.trim() } : {}),
      });
      setConversation(response.conversation);
      setAnalysis(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not start the conversation.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConversationRecording = async (
    blob: Blob,
    durationSeconds: number
  ) => {
    if (!conversation || analysis) return;

    setTranscribing(true);
    setError('');
    try {
      const response = await transcribeAudio(blob, durationSeconds);
      if (!response.transcript?.trim()) {
        setError('No speech was detected. Please try recording again.');
        return;
      }

      const messageResponse = await sendMessage(
        conversation._id,
        response.transcript,
        durationSeconds
      );
      setConversation(messageResponse.conversation);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not process that recording.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const endOpenConversation = async () => {
    if (
      !conversation ||
      loading ||
      transcribing ||
      !conversation.messages.some((message) => message.role === 'user')
    ) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await completeConversation(conversation._id);
      setConversation(response.conversation);
      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not complete the conversation.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (conversation) {
    return (
      <PageShell
        eyebrow="Open conversation"
        title={<>No script.<br /><em>Just speak.</em></>}
        description="Follow your ideas naturally and end the conversation when you are ready for your speaking analysis."
        back={() => navigate('/conversation')}
      >
        <section className="feedback-section">
          <div className="conversation-messages">
            {conversation.messages.map((message, index) => (
              <div
                className={`conversation-message ${message.role}`}
                key={`${message.role}-${index}`}
              >
                <strong>{message.role === 'assistant' ? selectedTutor : 'You'}</strong>
                <p>{message.content}</p>
              </div>
            ))}
          </div>

          {analysis ? (
            <div className="results-breakdown">
              <span className="eyebrow">Conversation speaking analysis</span>
              <h2>Overall score: {analysis.overall}/100</h2>
              <div className="score-list">
                <ScoreCard label="Fluency" value={String(analysis.fluency)} change="" tone="teal" />
                <ScoreCard label="Grammar" value={String(analysis.grammar)} change="" tone="blue" />
                <ScoreCard label="Vocabulary" value={String(analysis.vocabulary)} change="" tone="yellow" />
                <ScoreCard label="Pacing" value={String(analysis.pacing)} change="" tone="blue" />
              </div>
              {analysis.feedback?.[0] && <p>{analysis.feedback[0]}</p>}
              <button className="button primary" onClick={() => navigate('/conversation')}>
                Start another conversation <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <AudioRecorder onRecordingComplete={handleConversationRecording} />
              {transcribing && (
                <p role="status">Transcribing and sending your response...</p>
              )}
              <button
                className="button dark"
                onClick={endOpenConversation}
                disabled={
                  loading ||
                  transcribing ||
                  !conversation.messages.some((message) => message.role === 'user')
                }
              >
                {loading ? 'Analyzing...' : 'End conversation'} <ArrowRight size={16} />
              </button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      </PageShell>
    );
  }

  return (

    <PageShell

      eyebrow="Open conversation"

      title={

        <>

          No script.

          <br />

          <em>Just speak.</em>

        </>

      }

      description="Choose a companion and start a natural conversation."

      back={() => navigate('/dashboard')}

    >

      <div className="conversation-layout">

        <section className="conversation-intro">

          <div className="conversation-orb">

            <MessageIcon />

          </div>

          <h2>What is on your mind?</h2>

          <p>

            Talk about your day, share an idea, or let Speakora guide the flow.

          </p>

          <div className="conversation-suggestions">
            <button onClick={() => setTopic('Something I learned')}>
              Something I learned
            </button>
            <button onClick={() => setTopic('A recent adventure')}>
              A recent adventure
            </button>
            <button onClick={() => setTopic('')}>
              Start freely
            </button>
          </div>

        </section>

        <section className="conversation-tutor">

          <label>
            <span className="eyebrow">Your conversation partner</span>
            <select
              value={selectedTutor}
              onChange={(event) => setSelectedTutor(event.target.value)}
              disabled={loading}
            >
              {availableTutors.map((tutor) => (
                <option key={tutor.name} value={tutor.name}>
                  {tutor.name} — {tutor.style}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow">Topic (optional)</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What would you like to talk about?"
              disabled={loading}
            />
          </label>

          <div className="conversation-controls">

            <button

              className="button primary"

              onClick={startOpenConversation}
              disabled={loading || !selectedTutor}

            >

              Start talking <ArrowRight size={16} />

            </button>

            <button

              className="button outline"

              onClick={() => setTopic('')}

            >

              Clear topic
            </button>

          </div>

        </section>

      </div>

    </PageShell>

  );

}

function RoleplayPage({ navigate }: { navigate: Navigate }) {
  const [scenarios, setScenarios] = useState<{ id: string; label: string }[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof completeRoleplay>>['analysis'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTutors()
      .then((response) => {
        setScenarios(response.scenarios);
        setSelectedScenario(response.scenarios[0]?.id || '');
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load roleplay scenarios.');
      });
  }, []);

  const startRoleplay = async (scenarioId = selectedScenario) => {
    if (!scenarioId) return;
    setLoading(true);
    setError('');
    try {
      const response = await startConversation({
        mode: 'roleplay',
        scenario: scenarioId,
      });
      setConversation(response.conversation);
      setAnalysis(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not start the roleplay.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecording = async (blob: Blob, durationSeconds: number) => {
    if (!conversation) return;
    setTranscribing(true);
    setError('');
    try {
      const transcription = await transcribeAudio(blob, durationSeconds);
      if (!transcription.transcript?.trim()) {
        setError('No speech was detected. Please try recording again.');
        return;
      }
      const response = await sendMessage(
        conversation._id,
        transcription.transcript,
        durationSeconds
      );
      setConversation(response.conversation);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not process that recording.');
    } finally {
      setTranscribing(false);
    }
  };

  const endRoleplay = async () => {
    if (!conversation) return;
    setLoading(true);
    setError('');
    try {
      const response = await completeRoleplay(conversation._id);
      setConversation(response.conversation);
      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not finish the roleplay.');
    } finally {
      setLoading(false);
    }
  };

  if (conversation) {
    return (
      <PageShell
        eyebrow="Roleplay session"
        title={<>Stay in the<br /><em>conversation.</em></>}
        description="Speak naturally, then end the session when you are ready for your analysis."
        back={() => navigate('/roleplay')}
      >
        <section className="feedback-section">
          <div className="conversation-messages">
            {conversation.messages.map((message, index) => (
              <div className={`conversation-message ${message.role}`} key={`${message.role}-${index}`}>
                <strong>{message.role === 'assistant' ? 'Scenario partner' : 'You'}</strong>
                <p>{message.content}</p>
              </div>
            ))}
          </div>

          {analysis ? (
            <div className="results-breakdown">
              <span className="eyebrow">Roleplay analysis</span>
              <h2>Overall score: {analysis.overall}/100</h2>
              <div className="score-list">
                <ScoreCard label="Fluency" value={String(analysis.fluency)} change="" tone="teal" />
                <ScoreCard label="Grammar" value={String(analysis.grammar)} change="" tone="blue" />
                <ScoreCard label="Vocabulary" value={String(analysis.vocabulary)} change="" tone="yellow" />
                <ScoreCard label="Pacing" value={String(analysis.pacing)} change="" tone="blue" />
              </div>
              {analysis.feedback.length > 0 && <p>{analysis.feedback[0]}</p>}
              <button className="button primary" onClick={() => navigate('/roleplay')}>
                Practice another scenario <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <AudioRecorder onRecordingComplete={handleRecording} />
              {transcribing && <p role="status">Transcribing and sending your response...</p>}
              <button
                className="button dark"
                onClick={endRoleplay}
                disabled={loading || transcribing || !conversation.messages.some((message) => message.role === 'user')}
              >
                {loading ? 'Analyzing...' : 'End roleplay'} <ArrowRight size={16} />
              </button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      </PageShell>
    );
  }

  return (

    <PageShell

      eyebrow="Roleplay studio"

      title={

        <>

          Practice the

          <br />

          <em>real moments.</em>

        </>

      }

      description="Step into a situation, find your words, and leave feeling ready."

      back={() => navigate('/dashboard')}

    >

      <div className="roleplay-grid">

        <div className="roleplay-feature">

          <span className="pill light">Recommended for you</span>

          <h2>

            Give a presentation

            <br />

            with <em>confidence.</em>

          </h2>

          <p>

            Practice opening your presentation, making your point, and handling

            a question.

          </p>

          <div className="roleplay-footer">

            <span>

              <Clock3Icon /> 5–8 minutes

            </span>

            <span>

              <UserRound size={14} /> Business English

            </span>

            <button className="button dark" onClick={() => navigate('/presentation')}>
              Enter presentation <ArrowRight size={16} />
            </button>

          </div>

        </div>

        <div className="roleplay-list">

          <span className="eyebrow">More scenarios</span>

          {scenarios.map((scenario, index) => (

            <button

              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario.id);
                startRoleplay(scenario.id);
              }}

            >

              <span className={`scenario-number n${index}`}>

                0{index + 1}

              </span>

              <span>

                <strong>{scenario.label}</strong>
                <small>Select this scenario and begin a real conversation</small>

              </span>

              <ChevronRight size={17} />

            </button>

          ))}

        </div>

      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}

    </PageShell>

  );

}

function PresentationPage({ navigate }: { navigate: Navigate }) {
  const [topics, setTopics] = useState<SpeakingTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [analysis, setAnalysis] = useState<
    Awaited<ReturnType<typeof completePresentation>>['analysis'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPresentationTopics()
      .then((response) => {
        setTopics(response.topics);
        setSelectedTopicId(response.topics[0]?._id || '');
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load presentation topics.'
        );
      });
  }, []);

  const selectedTopic = topics.find((topic) => topic._id === selectedTopicId);

  const startPresentationSession = async () => {
    if (!selectedTopicId) {
      setError('Choose a presentation topic before starting.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await startPresentation();
      setSession(response.session);
      setTranscript('');
      setDurationSeconds(0);
      setAnalysis(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not start the presentation.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePresentationRecording = async (
    blob: Blob,
    segmentDurationSeconds: number
  ) => {
    if (!session || analysis) return;

    setTranscribing(true);
    setError('');
    try {
      const response = await transcribeAudio(blob, segmentDurationSeconds);
      if (!response.transcript?.trim()) {
        setError('No speech was detected. Please try recording again.');
        return;
      }

      setTranscript((current) =>
        current ? `${current}\n\n${response.transcript.trim()}` : response.transcript.trim()
      );
      setDurationSeconds((current) => current + Math.max(0, segmentDurationSeconds));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not transcribe that presentation segment.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const endPresentation = async () => {
    if (!session || !transcript.trim() || loading || transcribing) return;

    setLoading(true);
    setError('');
    try {
      const response = await completePresentation(
        session._id,
        transcript,
        durationSeconds
      );
      setSession(response.session);
      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not complete the presentation.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <PageShell
        eyebrow="Presentation practice"
        title={<>Present your<br /><em>ideas clearly.</em></>}
        description={selectedTopic?.prompt || selectedTopic?.title || 'Deliver your presentation naturally, one segment at a time.'}
        back={() => navigate('/presentation')}
      >
        <section className="feedback-section">
          <h2>{selectedTopic?.title}</h2>
          <div className="transcript-card">
            <span className="eyebrow">Your presentation transcript</span>
            <p>{transcript || 'Your transcript will appear here after you record a segment.'}</p>
          </div>

          {analysis ? (
            <div className="results-breakdown">
              <span className="eyebrow">Presentation speaking analysis</span>
              <h2>Overall score: {analysis.overall}/100</h2>
              <div className="score-list">
                <ScoreCard label="Fluency" value={String(analysis.fluency)} change="" tone="teal" />
                <ScoreCard label="Grammar" value={String(analysis.grammar)} change="" tone="blue" />
                <ScoreCard label="Vocabulary" value={String(analysis.vocabulary)} change="" tone="yellow" />
                <ScoreCard label="Pacing" value={String(analysis.pacing)} change="" tone="blue" />
              </div>
              {analysis.feedback?.[0] && <p>{analysis.feedback[0]}</p>}
              <button className="button primary" onClick={() => navigate('/presentation')}>
                Present another topic <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <AudioRecorder onRecordingComplete={handlePresentationRecording} />
              {transcribing && (
                <p role="status">Transcribing this presentation segment...</p>
              )}
              <button
                className="button dark"
                onClick={endPresentation}
                disabled={loading || transcribing || !transcript.trim()}
              >
                {loading ? 'Analyzing...' : 'End presentation'} <ArrowRight size={16} />
              </button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Presentation studio"
      title={<>Share your<br /><em>point of view.</em></>}
      description="Choose a real speaking topic, then build your presentation in recorded segments."
      back={() => navigate('/dashboard')}
    >
      <section className="feedback-section">
        <label>
          <span className="eyebrow">Presentation topic</span>
          <select
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
            disabled={loading}
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>{topic.title}</option>
            ))}
          </select>
        </label>
        {selectedTopic && (
          <p>{selectedTopic.prompt || selectedTopic.title}</p>
        )}
        <button
          className="button dark"
          onClick={startPresentationSession}
          disabled={loading || !selectedTopicId}
        >
          {loading ? 'Starting...' : 'Start presentation'} <ArrowRight size={16} />
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </section>
    </PageShell>
  );
}

function Clock3Icon() {

  return <Timer value="" />;

}

function DebatePage({ navigate }: { navigate: Navigate }) {
  const [topics, setTopics] = useState<{ id: string; title: string; prompt: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [position, setPosition] = useState<'for' | 'against' | ''>('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<
    Awaited<ReturnType<typeof completeDebate>>['analysis'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTutors()
      .then((response) => {
        setTopics(response.debateTopics);
        setSelectedTopic(response.debateTopics[0]?.id || '');
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load debate topics.'
        );
      });
  }, []);

  const startDebate = async (
    topicId = selectedTopic,
    debatePosition = position
  ) => {
    if (!topicId || !debatePosition) {
      setError('Choose a debate topic and a position before starting.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await startConversation({
        mode: 'debate',
        debateTopic: topicId,
        debatePosition,
      });
      setConversation(response.conversation);
      setAnalysis(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not start the debate.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDebateRecording = async (
    blob: Blob,
    durationSeconds: number
  ) => {
    if (!conversation) return;

    setTranscribing(true);
    setError('');
    try {
      const transcription = await transcribeAudio(blob, durationSeconds);
      if (!transcription.transcript?.trim()) {
        setError('No speech was detected. Please try recording again.');
        return;
      }

      const response = await sendMessage(
        conversation._id,
        transcription.transcript,
        durationSeconds
      );
      setConversation(response.conversation);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not process that recording.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const endDebate = async () => {
    if (!conversation) return;

    setLoading(true);
    setError('');
    try {
      const response = await completeDebate(conversation._id);
      setConversation(response.conversation);
      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not complete the debate.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (conversation) {
    return (
      <PageShell
        eyebrow="Debate session"
        title={<>Make your<br /><em>case clearly.</em></>}
        description="Respond to the counterargument, then end the debate when you are ready for your speaking analysis."
        back={() => navigate('/debate')}
      >
        <section className="feedback-section">
          <div className="conversation-messages">
            {conversation.messages.map((message, index) => (
              <div
                className={`conversation-message ${message.role}`}
                key={`${message.role}-${index}`}
              >
                <strong>{message.role === 'assistant' ? 'Debate partner' : 'You'}</strong>
                <p>{message.content}</p>
              </div>
            ))}
          </div>

          {analysis ? (
            <div className="results-breakdown">
              <span className="eyebrow">Debate speaking analysis</span>
              <h2>Overall score: {analysis.overall}/100</h2>
              <div className="score-list">
                <ScoreCard label="Fluency" value={String(analysis.fluency)} change="" tone="teal" />
                <ScoreCard label="Grammar" value={String(analysis.grammar)} change="" tone="blue" />
                <ScoreCard label="Vocabulary" value={String(analysis.vocabulary)} change="" tone="yellow" />
                <ScoreCard label="Pacing" value={String(analysis.pacing)} change="" tone="blue" />
              </div>
              {analysis.feedback.length > 0 && <p>{analysis.feedback[0]}</p>}
              <button className="button primary" onClick={() => navigate('/debate')}>
                Start another debate <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <AudioRecorder onRecordingComplete={handleDebateRecording} />
              {transcribing && (
                <p role="status">Transcribing and sending your response...</p>
              )}
              <button
                className="button dark"
                onClick={endDebate}
                disabled={
                  loading ||
                  transcribing ||
                  !conversation.messages.some((message) => message.role === 'user')
                }
              >
                {loading ? 'Analyzing...' : 'End debate'} <ArrowRight size={16} />
              </button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      </PageShell>
    );
  }

  return (

    <PageShell

      eyebrow="Debate room"

      title={

        <>

          Think it through.

          <br />

          <em>Say it clearly.</em>

        </>

      }

      description="Build the confidence to express an opinion and support it."

      back={() => navigate('/dashboard')}

    >

      <div className="debate-card">

        <div className="debate-label">

          <Sparkles size={15} /> Today's question

        </div>

        <h2>{topics.find((topic) => topic.id === selectedTopic)?.title || 'Choose a debate topic'}</h2>

        <label>
          <span className="eyebrow">Topic</span>
          <select
            value={selectedTopic}
            onChange={(event) => setSelectedTopic(event.target.value)}
            disabled={loading}
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.title}</option>
            ))}
          </select>
        </label>

        <div className="debate-options">

          <button
            className={position === 'for' ? 'selected' : ''}
            onClick={() => setPosition('for')}
            disabled={loading}
          >

            <span>FOR</span>

            <strong>Yes, absolutely</strong>

            <small>Explore the benefits</small>

          </button>

          <button
            className={position === 'against' ? 'selected' : ''}
            onClick={() => setPosition('against')}
            disabled={loading}
          >

            <span>AGAINST</span>

            <strong>Not so fast</strong>

            <small>Challenge the idea</small>

          </button>

        </div>

        <div className="debate-note">
          <CircleHelp size={16} /> You will have 90 seconds to make your case.
        </div>
        <button
          className="button dark"
          onClick={() => startDebate()}
          disabled={loading || !selectedTopic || !position}
        >
          {loading ? 'Starting...' : 'Start debate'} <ArrowRight size={16} />
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </div>

    </PageShell>

  );

}

function TutorsPage({ navigate }: { navigate: Navigate }) {

  return (

    <PageShell

      eyebrow="Your AI studio"

      title={

        <>

          Find your

          <br />

          <em>conversation style.</em>

        </>

      }

      description="Every tutor brings a different energy to your practice."

      back={() => navigate('/dashboard')}

    >

      <div className="tutors-grid">

        {tutors.map((tutor) => (

          <TutorCard

            key={tutor.name}

            {...tutor}

            onSelect={() => navigate('/conversation')}

          />

        ))}

      </div>

      <div className="custom-tutor">

        <div>

          <span className="eyebrow">Make it yours</span>

          <h2>Or describe the conversation you need.</h2>

          <p>

            Practice a specific situation, tone, or topic with a tutor shaped

            around you.

          </p>

        </div>

        <button

          className="button dark"

          onClick={() => navigate('/conversation')}

        >

          Create a conversation <ArrowRight size={16} />

        </button>

      </div>

    </PageShell>

  );

}

function AssessmentPage({ navigate }: { navigate: Navigate }) {

  const [step, setStep] = useState(1);

  const [confidenceGoal, setConfidenceGoal] = useState('');

  const [speakingFrequency, setSpeakingFrequency] = useState('');

  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleFinalAnswer = async (value: string) => {

    setSubmitting(true);

    setError('');

    try {

      await submitAssessment(

        confidenceGoal,

        speakingFrequency,

        value

      );

      navigate('/dashboard');

    } catch (requestError) {

      setError(

        requestError instanceof ApiError

          ? requestError.message

          : 'Unable to save your assessment. Please try again.'

      );

      setSubmitting(false);

    }

  };

  const step1Choices = [

    'Everyday conversations',

    'Work & presentations',

    'Travel & new places',

    'Sharing my ideas',

  ];

  const step2Choices = [

    'Almost every day',

    'A few times a week',

    'Once in a while',

    'I am just getting started',

  ];

  const step3Choices = [

    'A quick warm-up',

    'A thoughtful conversation',

    'A real-world roleplay',

    'Surprise me',

  ];

  return (

    <PageShell

      eyebrow={`Getting to know you · 0${step} / 03`}

      title={

        <>

          Let's make this

          <br />

          <em>yours.</em>

        </>

      }

      description="A few questions help us find the right starting point."

      back={() => navigate('/dashboard')}

    >

      <div className="assessment-wrap">

        <div className="assessment-progress">

          <span className="filled" />

          <span className={step > 1 ? 'filled' : ''} />

          <span className={step > 2 ? 'filled' : ''} />

        </div>

        {step === 1 && (

          <div className="assessment-step">

            <h2>

              What would you like to feel

              <br />

              more confident doing?

            </h2>

            <div className="choice-grid">

              {step1Choices.map((item, i) => (

                <button

                  key={item}

                  disabled={submitting}

                  onClick={() => {

                    setConfidenceGoal(item);

                    setStep(2);

                  }}

                >

                  <span>{['◌', '▣', '◎', '✦'][i]}</span>

                  {item}

                  <ChevronRight size={16} />

                </button>

              ))}

            </div>

          </div>

        )}

        {step === 2 && (

          <div className="assessment-step">

            <h2>

              How often do you currently

              <br />

              speak English?

            </h2>

            <div className="choice-grid">

              {step2Choices.map((item) => (

                <button

                  key={item}

                  disabled={submitting}

                  onClick={() => {

                    setSpeakingFrequency(item);

                    setStep(3);

                  }}

                >

                  <span>○</span>

                  {item}

                  <ChevronRight size={16} />

                </button>

              ))}

            </div>

          </div>

        )}

        {step === 3 && (

          <div className="assessment-step">

            <h2>

              What kind of practice

              <br />

              sounds good today?

            </h2>

            <div className="choice-grid">

              {step3Choices.map((item) => (

                <button

                  key={item}

                  disabled={submitting}

                  onClick={() => handleFinalAnswer(item)}

                >

                  <span>✦</span>

                  {submitting ? 'Saving…' : item}

                  <ChevronRight size={16} />

                </button>

              ))}

            </div>

          </div>

        )}

        {error && (

          <p

            className="auth-error"

            role="alert"

            style={{

              textAlign: 'center',

              marginTop: '20px',

            }}

          >

            {error}

          </p>

        )}

        <div className="assessment-help">

          <CircleHelp size={16} /> There are no wrong answers. Just honest ones.

        </div>

      </div>

    </PageShell>

  );

}

function displaySkill(skill: string, fallback = '—') {
  if (!skill) {
    return fallback;
  }

  return `${skill.charAt(0).toUpperCase()}${skill.slice(1)}`;
}

function ProfilePage({ navigate }: { navigate: Navigate }) {

  const { logout, user } = useAuth();
  const [speakingProfile, setSpeakingProfile] =
    useState<SpeakingProfile | null>(null);
  const [vocabularyProfile, setVocabularyProfile] =
    useState<ProfileResponse['vocabularyProfile']>(undefined);
  const [overusedWords, setOverusedWords] =
    useState<ProfileResponse['overusedWords']>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([getSpeakingProfile(), getProfile()])
      .then(([speakingResponse, profileResponse]) => {
        if (mounted) {
          setSpeakingProfile(speakingResponse.profile);
          setVocabularyProfile(profileResponse.vocabularyProfile);
          setOverusedWords(profileResponse.overusedWords || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setSpeakingProfile(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setProfileLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (

    <PageShell

      eyebrow="Your profile"

      title={

        <>

          This is your

          <br />

          <em>space to grow.</em>

        </>

      }

      description="Keep your goals and preferences close at hand."

      back={() => navigate('/dashboard')}

    >

      <div className="profile-layout">

        <section className="profile-card">

          <div className="profile-cover" />

          <div className="profile-main">

            <span className="avatar profile-avatar">AR</span>

            <button className="button outline small">

              Edit profile

            </button>

            <h2>{user?.name || 'Alex Rivera'}</h2>

            <p>Finding confidence, one conversation at a time.</p>

            <div className="profile-details">

              <span>

                <Globe2 size={15} /> English learner

              </span>

              <span>

                <Target size={15} /> Everyday confidence

              </span>

            </div>

          </div>

        </section>

        <section className="preferences-card">

          <div className="section-heading">

            <div>

              <span className="eyebrow">Preferences</span>

              <h2>Your practice, your way</h2>

            </div>

            <button

              className="text-link"

              onClick={() => {

                logout();

                navigate('/');

              }}

            >

              Sign out

            </button>

          </div>

          <label>

            Preferred feedback style

            <select>

              <option>Warm and encouraging</option>

              <option>Direct and focused</option>

            </select>

          </label>

          <label>

            Weekly practice goal

            <select>

              <option>3 sessions per week</option>

              <option>5 sessions per week</option>

            </select>

          </label>

          <button

            className="button primary"

            onClick={() => navigate('/dashboard')}

          >

            Save changes <Check size={16} />

          </button>

        </section>

        <section className="feedback-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vocabulary history</span>
              <h2>Vocabulary progress</h2>
            </div>
          </div>

          {!vocabularyProfile ||
          !Array.isArray(vocabularyProfile.words) ||
          vocabularyProfile.words.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Complete a speaking session to start building your vocabulary history.
            </p>
          ) : (
            (() => {
              const words = vocabularyProfile.words.filter(
                (entry) =>
                  typeof entry.word === 'string' &&
                  entry.word.trim() &&
                  Number.isFinite(entry.count)
              );
              const frequentWords = [...words]
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
              const recentWords = [...words]
                .filter(
                  (entry) =>
                    entry.lastUsedAt &&
                    Number.isFinite(new Date(entry.lastUsedAt).getTime())
                )
                .sort(
                  (a, b) =>
                    new Date(b.lastUsedAt || 0).getTime() -
                    new Date(a.lastUsedAt || 0).getTime()
                )
                .slice(0, 5);
              const targetWords = (vocabularyProfile.targetWords || []).filter(
                (entry) => typeof entry.word === 'string' && entry.word.trim()
              );

              return (
                <div className="vocabulary-list">
                  <div className="vocabulary-item">
                    <div>
                      <span className="answer-label">Tracked word uses</span>
                      <strong>{vocabularyProfile.totalWordsUsed || 0}</strong>
                      <span className="vocabulary-meaning">
                        {words.length} unique tracked words
                      </span>
                    </div>
                  </div>

                  <div className="vocabulary-item">
                    <div>
                      <span className="answer-label">Most frequently used</span>
                      <strong>
                        {frequentWords.length > 0
                          ? frequentWords
                              .map((entry) => `${entry.word} × ${entry.count}`)
                              .join(', ')
                          : 'No tracked words yet.'}
                      </strong>
                    </div>
                  </div>

                  <div className="vocabulary-item">
                    <div>
                      <span className="answer-label">Overused words</span>
                      <strong>
                        {overusedWords.length > 0
                          ? overusedWords
                              .map((entry) => `${entry.word} × ${entry.count}`)
                              .join(', ')
                          : 'No overused words yet.'}
                      </strong>
                    </div>
                  </div>

                  <div className="vocabulary-item">
                    <div>
                      <span className="answer-label">Recently used</span>
                      <strong>
                        {recentWords.length > 0
                          ? recentWords
                              .map(
                                (entry) =>
                                  `${entry.word} · ${new Date(
                                    entry.lastUsedAt || ''
                                  ).toLocaleDateString()}`
                              )
                              .join(', ')
                          : 'No recent usage dates available.'}
                      </strong>
                    </div>
                  </div>

                  {targetWords.length > 0 && (
                    <div className="vocabulary-item">
                      <div>
                        <span className="answer-label">Practice vocabulary</span>
                        <strong>
                          {targetWords
                            .slice(0, 5)
                            .map(
                              (entry) =>
                                `${entry.word} · practiced ${entry.practicedCount || 0} times`
                            )
                            .join(', ')}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </section>

        <section className="feedback-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">Speaking profile</span>

              <h2>Your skills at a glance</h2>

            </div>

            {speakingProfile && speakingProfile.sessionsAnalyzed > 0 && (

              <span className="pill light">

                {speakingProfile.difficulty}

              </span>

            )}

          </div>

          {profileLoading ? (

            <p

              style={{ color: 'var(--muted)', fontSize: '12px' }}

            >

              Loading your speaking profile…

            </p>

          ) : !speakingProfile ||

            speakingProfile.sessionsAnalyzed === 0 ? (

            <p

              style={{ color: 'var(--muted)', fontSize: '12px' }}

            >

              Complete your first speaking practice to build your

              speaking profile. Your scores, strongest and weakest

              skills, and progress will appear here.

            </p>

          ) : (

            <div className="score-list">

              <ScoreCard

                label="Overall performance"

                value={`${speakingProfile.averageOverall}/100`}

                change=""

                tone="teal"

              />

              <ScoreCard

                label="Sessions analyzed"

                value={String(speakingProfile.sessionsAnalyzed)}

                change=""

                tone="blue"

              />

              <ScoreCard

                label="Current difficulty"

                value={speakingProfile.difficulty}

                change=""

                tone="yellow"

              />

              <ScoreCard

                label="Strongest skill"

                value={displaySkill(speakingProfile.strongestSkill)}

                change=""

                tone="teal"

              />

              <ScoreCard

                label="Weakest skill"

                value={displaySkill(speakingProfile.weakestSkill)}

                change=""

                tone="coral"

              />

              <ScoreCard

                label="Improving skill"

                value={displaySkill(

                  speakingProfile.improvingSkill,

                  'Not enough data yet'

                )}

                change=""

                tone="blue"

              />

              <ScoreCard

                label="Declining skill"

                value={displaySkill(

                  speakingProfile.decliningSkill,

                  'Not enough data yet'

                )}

                change=""

                tone="yellow"

              />

              <ScoreCard

                label="Grammar"

                value={String(speakingProfile.averageGrammar)}

                change=""

                tone="yellow"

              />

              <ScoreCard

                label="Fluency"

                value={String(speakingProfile.averageFluency)}

                change=""

                tone="teal"

              />

              <ScoreCard

                label="Vocabulary"

                value={String(speakingProfile.averageVocabulary)}

                change=""

                tone="coral"

              />

              <ScoreCard

                label="Pacing"

                value={String(speakingProfile.averagePacing)}

                change=""

                tone="blue"

              />

            </div>

          )}

        </section>

      </div>

    </PageShell>

  );

}

function AuthPage({

  signup,

  navigate,

}: {

  signup: boolean;

  navigate: Navigate;

}) {

  const { login, loginWithGoogle, register } = useAuth();

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleScriptId = 'google-identity-services';

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError('');
          setSubmitting(true);
          try {
            await loginWithGoogle(response.credential);
            navigate(signup ? '/assessment' : '/dashboard');
          } catch (requestError) {
            setError(
              requestError instanceof ApiError
                ? requestError.message
                : 'Unable to sign in with Google. Please try again.'
            );
          } finally {
            setSubmitting(false);
          }
        },
      });
      setGoogleReady(true);
    };

    const existingScript = document.getElementById(googleScriptId);
    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = googleScriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setError('Unable to load Google authentication. Please use email and password.');
    };
    document.head.appendChild(script);
  }, [googleClientId, loginWithGoogle, navigate, signup]);

  const handleSubmit = async (

    event: FormEvent<HTMLFormElement>

  ) => {

    event.preventDefault();

    setError('');
    setValidationAttempted(true);

    if (

      !email.trim() ||

      !password ||

      (signup && !name.trim())

    ) {
      setError('Please complete all required fields.');
      if (signup && !name.trim()) {
        nameRef.current?.focus();
      } else if (!email.trim()) {
        emailRef.current?.focus();
      } else if (!password) {
        passwordRef.current?.focus();
      }
      return;

    }

    if (signup && password.length < 8) {

      setError('Password must be at least 8 characters.');

      return;

    }

    setSubmitting(true);

    try {

      if (signup) {

        await register(

          name.trim(),

          email.trim(),

          password

        );

        navigate('/assessment');

      } else {

        await login(

          email.trim(),

          password

        );

        navigate('/dashboard');

      }

    } catch (requestError) {

      setError(

        requestError instanceof ApiError

          ? requestError.message

          : 'Unable to complete your request. Please try again.'

      );

    } finally {

      setSubmitting(false);

    }

  };

  return (

    <div className="auth-page">

      <button

        className="brand auth-brand"

        onClick={() => navigate('/')}

      >

        <span className="brand-mark">

          <Sparkles size={17} />

        </span>

        Speakora

      </button>

      <div className="auth-card">

        <div className="auth-heading">

          <span className="eyebrow">

            {signup ? 'Start your journey' : 'Welcome back'}

          </span>

          <h1>

            {signup ? (

              <>

                Your voice

                <br />

                <em>starts here.</em>

              </>

            ) : (

              <>

                Good to

                <br />

                <em>see you.</em>

              </>

            )}

          </h1>

          <p>

            {signup

              ? 'Create a free account and find your speaking rhythm.'

              : 'Pick up exactly where you left off.'}

          </p>

        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {signup && (
            <label htmlFor="auth-name">
              Your name
              <div className="input-wrap">
                <UserRound size={17} />
                <input
                  ref={nameRef}
                  id="auth-name"
                  value={name}

                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  type="text"
                  placeholder="Alex Rivera"
                  autoComplete="name"
                  aria-invalid={validationAttempted && !name.trim()}
                  aria-describedby={error ? 'auth-error' : undefined}

                />

              </div>

            </label>

          )}

          <label htmlFor="auth-email">
            Email address
            <div className="input-wrap">
              <Mail size={17} />
              <input
                ref={emailRef}
                id="auth-email"
                value={email}

                onChange={(event) =>

                  setEmail(event.target.value)

                }

                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={validationAttempted && !email.trim()}
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>
          </label>

          <label htmlFor="auth-password">
            Password
            <div className="input-wrap">
              <LockKeyhole size={17} />
              <input
                ref={passwordRef}
                id="auth-password"
                value={password}

                onChange={(event) =>

                  setPassword(event.target.value)

                }

                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"

                autoComplete={

                  signup

                    ? 'new-password'
                    : 'current-password'
                }
                aria-invalid={validationAttempted && !password}
                aria-describedby={error ? 'auth-error' : undefined}
              />
              <button
                className="input-action"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {signup && (

            <label className="check-label">

              <input type="checkbox" /> I agree to the{' '}
              <span>Terms of service</span>

            </label>

          )}

          {error && (

            <p
              id="auth-error"
              className="auth-error"
              role="alert"

            >

              {error}

            </p>

          )}

          <button

            className="button primary full"

            type="submit"

            disabled={submitting}
            aria-busy={submitting}
          >

            {submitting

              ? 'Please wait…'

              : signup

                ? 'Create my account'

                : 'Log in to Speakora'}

            {!submitting && <ArrowRight size={16} />}

          </button>

        </form>

        <div className="auth-divider">

          <span>or continue with</span>

        </div>

        <button
          className="social-button"
          type="button"
          disabled={submitting || !googleReady}
          aria-busy={submitting}
          onClick={() => {
            setError('');
            if (!googleReady || !window.google?.accounts.id) {
              setError('Google authentication is not ready. Please try again.');
              return;
            }
            window.google.accounts.id.prompt();
          }}
        >
          {submitting ? 'Please wait…' : 'Continue with Google'}
        </button>

        <p className="auth-switch">

          {signup

            ? 'Already have an account?'

            : 'New to Speakora?'}

          {' '}

          <button

            onClick={() =>

              navigate(

                signup

                  ? '/login'

                  : '/signup'

              )

            }

          >

            {signup

              ? 'Log in'

              : 'Create an account'}

          </button>

        </p>

      </div>

      <span className="auth-footer">

        <ShieldCheck size={14} /> Your practice space is private and secure

      </span>

    </div>

  );

}

function App() {

  const { user, loading } = useAuth();

  const [path, setPath] = useState(

    window.location.hash.replace('#', '') || '/'

  );

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {

    const onHash = () =>

      setPath(

        window.location.hash.replace('#', '') || '/'

      );

    window.addEventListener(

      'hashchange',

      onHash

    );

    return () =>

      window.removeEventListener(

        'hashchange',

        onHash

      );

  }, []);

  const navigate = (next: string) => {

    window.location.hash = next;

    setPath(next);

    window.scrollTo({

      top: 0,

      behavior: 'smooth',

    });

  };

  const publicPage = [

    '/',

    '/login',

    '/signup',

  ].includes(path);

  useEffect(() => {

    if (

      !loading &&

      !user &&

      !publicPage

    ) {

      window.location.hash = '/login';

      setPath('/login');

    }

  }, [

    loading,

    publicPage,

    user,

  ]);

  if (publicPage) {

    return path === '/'

      ? <LandingPage navigate={navigate} />

      : (

        <AuthPage

          signup={path === '/signup'}

          navigate={navigate}

        />

      );

  }

  if (loading || !user) {

    return (

      <div className="auth-page">

        <span className="eyebrow">

          Loading your practice space…

        </span>

      </div>

    );

  }

  const pages: Record<string, ReactNode> = {

    '/dashboard': (

      <Dashboard navigate={navigate} />

    ),

    '/practice': (
      <PracticePage navigate={navigate} />
    ),

    '/pronunciation-practice': (
      <ReferencePracticePage navigate={navigate} />
    ),

    '/results': (

      <ResultsPage navigate={navigate} />

    ),

    '/progress': (

      <ProgressPage navigate={navigate} />

    ),

    '/conversation': (

      <ConversationPage navigate={navigate} />

    ),

    '/roleplay': (

      <RoleplayPage navigate={navigate} />

    ),

    '/presentation': (

      <PresentationPage navigate={navigate} />

    ),

    '/debate': (

      <DebatePage navigate={navigate} />

    ),

    '/tutors': (

      <TutorsPage navigate={navigate} />

    ),

    '/assessment': (

      <AssessmentPage navigate={navigate} />

    ),

    '/profile': (

      <ProfilePage navigate={navigate} />

    ),

  };

  return (

    <div className="app-shell">

      <Navbar

        onMenu={() => setMenuOpen(true)}

        onNavigate={navigate}

      />

      <Sidebar

        activePath={path}

        open={menuOpen}

        onClose={() => setMenuOpen(false)}

        onNavigate={navigate}

      />

      <div className="content-area">

        {pages[path] || (

          <Dashboard navigate={navigate} />

        )}

      </div>

    </div>

  );

}

export default App;
