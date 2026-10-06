import { useEffect, useState } from 'react';

import type { FormEvent, ReactNode } from 'react';

import {

  ArrowRight,

  Check,

  ChevronRight,

  CircleHelp,

  Globe2,

  LockKeyhole,

  Mail,

  Menu,

  Play,

  ShieldCheck,

  Sparkles,

  Target,

  Trophy,

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

  getLatestAnalysis,

  getLatestTranscription,

  setLatestSession,

  submitRecording,

} from '@/services/transcriptionState';

import {
  getRandomTopic,
  getSpeakingHistory,
  startSpeakingSession,
  type SpeakingSession,
  type SpeakingTopic,
} from '@/services/speakingService';

import {
  getProfile,
  type ProfileResponse,
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

      const { topic: randomTopic } =
        await getRandomTopic(excludeTopicId, true);

      const { session } =
        await startSpeakingSession(randomTopic._id);

      setTopic(randomTopic);
      setLatestSession(session);
      setAudioBlob(null);
      setDuration(0);
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
              Today's prompt
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

          <button
            className="text-link"
            onClick={handleNewTopic}
            disabled={loadingTopic || submitting}
            style={{ marginTop: '20px' }}
          >
            {loadingTopic ? 'Finding another topic…' : 'Try another topic'}
            {!loadingTopic && <ArrowRight size={14} />}
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

function ResultsPage({ navigate }: { navigate: Navigate }) {
  const transcription = getLatestTranscription();
  const analysis = getLatestAnalysis();

  useEffect(() => {
    return () => {
      clearLatestTranscription();
      clearLatestAnalysis();
    };
  }, []);

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
              onClick={() => navigate('/practice')}
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
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [loading, setLoading] = useState(true);

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

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const analyzedSessions = sessions
    .filter(
      (session) =>
        session.status === 'analyzed' &&
        session.analysis?.status === 'complete'
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;

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

  const today = new Date();

  const totalSpeakingSeconds = analyzedSessions.reduce(
    (sum, session) => sum + (session.durationSeconds || 0),
    0
  );

  const bestScore = analyzedSessions.length
    ? Math.max(
        ...analyzedSessions.map(
          (session) => session.analysis?.overall || 0
        )
      )
    : 0;

  const currentWeekStart = new Date(today);
  const currentDay = currentWeekStart.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

  currentWeekStart.setDate(
    currentWeekStart.getDate() - daysFromMonday
  );
  currentWeekStart.setHours(0, 0, 0, 0);

  const firstWeekStart = new Date(
    analyzedSessions[0]?.createdAt || today
  );
  const firstWeekDay = firstWeekStart.getDay();
  const firstWeekDaysFromMonday =
    firstWeekDay === 0 ? 6 : firstWeekDay - 1;

  firstWeekStart.setDate(
    firstWeekStart.getDate() - firstWeekDaysFromMonday
  );
  firstWeekStart.setHours(0, 0, 0, 0);

  const getWeekAverage = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const weekSessions = analyzedSessions.filter((session) => {
      const date = new Date(session.createdAt || 0);
      return date >= start && date < end;
    });

    if (!weekSessions.length) {
      return 0;
    }

    return (
      weekSessions.reduce(
        (sum, session) => sum + (session.analysis?.overall || 0),
        0
      ) / weekSessions.length
    );
  };

  const firstWeekAverage = getWeekAverage(firstWeekStart);
  const currentWeekAverage = getWeekAverage(currentWeekStart);

  let growth = 0;

  if (
    firstWeekStart.getTime() !== currentWeekStart.getTime() &&
    firstWeekAverage > 0
  ) {
    growth = Math.round(
      ((currentWeekAverage - firstWeekAverage) /
        firstWeekAverage) *
        100
    );
  }

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);

    const dateKey = getDateKey(date);

    const seconds = analyzedSessions
      .filter(
        (session) =>
          getDateKey(new Date(session.createdAt || 0)) ===
          dateKey
      )
      .reduce(
        (sum, session) => sum + (session.durationSeconds || 0),
        0
      );

    return {
      date,
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][
        index
      ],
      minutes: Math.round(seconds / 60),
    };
  });

  const maxMinutes = Math.max(
    10,
    ...weekDays.map((day) => day.minutes)
  );

  const milestones: {
    title: string;
    description: string;
    date: string;
    icon: 'trophy' | 'volume';
    tone: 'yellow' | 'teal';
  }[] = [];

  if (analyzedSessions.length > 0) {
    const firstSession = analyzedSessions[0];

    milestones.push({
      title: 'First practice completed',
      description: 'You completed your first analyzed speaking practice.',
      date: new Date(
        firstSession.createdAt || Date.now()
      ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      icon: 'trophy',
      tone: 'yellow',
    });
  }

  if (analyzedSessions.length >= 5) {
    const fifthSession = analyzedSessions[4];

    milestones.push({
      title: 'Found your rhythm',
      description: `Completed ${analyzedSessions.length} analyzed practices.`,
      date: new Date(
        fifthSession.createdAt || Date.now()
      ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      icon: 'trophy',
      tone: 'yellow',
    });
  }

  if (bestScore >= 80) {
    const bestSession = analyzedSessions.find(
      (session) => session.analysis?.overall === bestScore
    );

    milestones.push({
      title: 'Personal best',
      description: `Reached your highest overall score of ${Math.round(
        bestScore
      )}.`,
      date: new Date(
        bestSession?.createdAt || Date.now()
      ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      icon: 'volume',
      tone: 'teal',
    });
  }

  const visibleMilestones = milestones.slice(-3).reverse();

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
            <span className="eyebrow">Overall growth</span>

            <strong>
              {loading
                ? '—'
                : analyzedSessions.length < 2
                  ? '—'
                  : `${growth >= 0 ? '+' : ''}${growth}%`}
            </strong>

            <span>
              <ArrowRight size={13} />
              {analyzedSessions.length < 2
                ? 'Practice more to see your growth'
                : 'compared to your first week'}
            </span>
          </div>

          <div className="progress-stat-row">
            <MiniScore
              label="Speaking time"
              value={
                loading
                  ? '—'
                  : formatDuration(totalSpeakingSeconds)
              }
              detail=""
            />

            <MiniScore
              label="Sessions"
              value={loading ? '—' : String(analyzedSessions.length)}
              detail=""
            />

            <MiniScore
              label="Best score"
              value={loading ? '—' : String(Math.round(bestScore))}
              detail=""
            />
          </div>
        </section>

        <section className="chart-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your rhythm</span>
              <h2>Practice consistency</h2>
            </div>

            <span className="eyebrow">This week</span>
          </div>

          {analyzedSessions.length === 0 ? (
            <div
              style={{
                minHeight: '220px',
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: '12px',
              }}
            >
              Complete your first practice to see your speaking
              activity here.
            </div>
          ) : (
            <div className="chart">
              <div className="chart-y">
                <span>{maxMinutes}m</span>
                <span>{Math.round(maxMinutes * 0.66)}m</span>
                <span>{Math.round(maxMinutes * 0.33)}m</span>
                <span>0m</span>
              </div>

              <div className="bars">
                {weekDays.map((day) => {
                  const height =
                    day.minutes === 0
                      ? 5
                      : Math.max(
                          5,
                          (day.minutes / maxMinutes) * 100
                        );

                  const isToday =
                    getDateKey(day.date) ===
                    getDateKey(today);

                  return (
                    <div
                      className="bar-col"
                      key={getDateKey(day.date)}
                    >
                      <span
                        className="bar-value"
                        style={{
                          display:
                            day.minutes > 0 ? 'block' : 'none',
                        }}
                      >
                        {day.minutes}m
                      </span>

                      <div
                        className={`bar ${
                          isToday ? 'highlight' : ''
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <small>{day.label}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="milestones">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Keep going</span>
              <h2>Recent milestones</h2>
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
          ) : visibleMilestones.length === 0 ? (
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                paddingTop: '20px',
              }}
            >
              Your milestones will appear here as you practice.
            </p>
          ) : (
            visibleMilestones.map((milestone, index) => (
              <div className="milestone" key={`${milestone.title}-${index}`}>
                <span
                  className={`milestone-icon ${
                    milestone.tone === 'yellow'
                      ? 'yellow-bg'
                      : 'teal-bg'
                  }`}
                >
                  {milestone.icon === 'trophy' ? (
                    <Trophy size={17} />
                  ) : (
                    <Volume2 size={17} />
                  )}
                </span>

                <div>
                  <strong>{milestone.title}</strong>
                  <p>{milestone.description}</p>
                </div>

                <small>{milestone.date}</small>
              </div>
            ))
          )}
        </section>
      </div>
    </PageShell>
  );
}

function ConversationPage({ navigate }: { navigate: Navigate }) {

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

            <button onClick={() => navigate('/practice')}>

              Something I learned

            </button>

            <button onClick={() => navigate('/practice')}>

              A recent adventure

            </button>

            <button onClick={() => navigate('/practice')}>

              Surprise me

            </button>

          </div>

        </section>

        <section className="conversation-tutor">

          <span className="eyebrow">Your conversation partner</span>

          <TutorCard

            {...tutors[0]}

            onSelect={() => navigate('/practice')}

          />

          <div className="conversation-controls">

            <button

              className="button primary"

              onClick={() => navigate('/practice')}

            >

              Start talking <ArrowRight size={16} />

            </button>

            <button

              className="button outline"

              onClick={() => navigate('/tutors')}

            >

              Choose another

            </button>

          </div>

        </section>

      </div>

    </PageShell>

  );

}

function RoleplayPage({ navigate }: { navigate: Navigate }) {

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

            <button

              className="button dark"

              onClick={() => navigate('/practice')}

            >

              Enter scene <ArrowRight size={16} />

            </button>

          </div>

        </div>

        <div className="roleplay-list">

          <span className="eyebrow">More scenarios</span>

          {[

            ['A job interview', 'Make a strong first impression'],

            ['Meeting a new neighbor', 'Keep a friendly conversation flowing'],

            ['Asking for feedback', 'Say what you need clearly'],

          ].map(([title, description], index) => (

            <button

              key={title}

              onClick={() => navigate('/practice')}

            >

              <span className={`scenario-number n${index}`}>

                0{index + 1}

              </span>

              <span>

                <strong>{title}</strong>

                <small>{description}</small>

              </span>

              <ChevronRight size={17} />

            </button>

          ))}

        </div>

      </div>

    </PageShell>

  );

}

function Clock3Icon() {

  return <Timer value="" />;

}

function DebatePage({ navigate }: { navigate: Navigate }) {

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

        <h2>

          Should every workplace

          <br />

          have a <em>four-day week?</em>

        </h2>

        <div className="debate-options">

          <button onClick={() => navigate('/practice')}>

            <span>FOR</span>

            <strong>Yes, absolutely</strong>

            <small>Explore the benefits</small>

          </button>

          <button onClick={() => navigate('/practice')}>

            <span>AGAINST</span>

            <strong>Not so fast</strong>

            <small>Challenge the idea</small>

          </button>

        </div>

        <div className="debate-note">

          <CircleHelp size={16} /> You will have 90 seconds to make your case.

        </div>

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

function ProfilePage({ navigate }: { navigate: Navigate }) {

  const { logout, user } = useAuth();

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

  const { login, register } = useAuth();

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (

    event: FormEvent<HTMLFormElement>

  ) => {

    event.preventDefault();

    setError('');

    if (

      !email.trim() ||

      !password ||

      (signup && !name.trim())

    ) {

      setError('Please complete all required fields.');

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

            <label>

              Your name

              <div className="input-wrap">

                <UserRound size={17} />

                <input

                  value={name}

                  onChange={(event) =>

                    setName(event.target.value)

                  }

                  type="text"

                  placeholder="Alex Rivera"

                  autoComplete="name"

                />

              </div>

            </label>

          )}

          <label>

            Email address

            <div className="input-wrap">

              <Mail size={17} />

              <input

                value={email}

                onChange={(event) =>

                  setEmail(event.target.value)

                }

                type="email"

                placeholder="you@example.com"

                autoComplete="email"

              />

            </div>

          </label>

          <label>

            Password

            <div className="input-wrap">

              <LockKeyhole size={17} />

              <input

                value={password}

                onChange={(event) =>

                  setPassword(event.target.value)

                }

                type="password"

                placeholder="At least 8 characters"

                autoComplete={

                  signup

                    ? 'new-password'

                    : 'current-password'

                }

              />

            </div>

          </label>

          {signup && (

            <label className="check-label">

              <input type="checkbox" /> I agree to the{' '}

              <u>Terms of service</u>

            </label>

          )}

          {error && (

            <p

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

        >

          Continue with Google

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
