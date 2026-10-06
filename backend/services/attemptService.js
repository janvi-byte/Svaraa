import AnalysisResult from '../models/AnalysisResult.js';
import SpeakingSession from '../models/SpeakingSession.js';

const COMPARISON_METRICS = [
  { key: 'overall', label: 'Overall', direction: 'up' },
  { key: 'grammar', label: 'Grammar', direction: 'up' },
  { key: 'fluency', label: 'Fluency', direction: 'up' },
  { key: 'vocabulary', label: 'Vocabulary', direction: 'up' },
  { key: 'pacing', label: 'Pacing', direction: 'up' },
  { key: 'fillerCount', label: 'Filler words', direction: 'down' },
  {
    key: 'wordsPerMinute',
    label: 'Words per minute',
    direction: 'band',
    band: [110, 160],
  },
  {
    key: 'vocabularyDiversity',
    label: 'Vocabulary variety',
    direction: 'up',
  },
  {
    key: 'repeatedPhraseCount',
    label: 'Repeated phrases',
    direction: 'down',
  },
];

function readValue(analysis, key) {
  const value = Number(analysis?.[key]);
  return Number.isFinite(value) ? value : 0;
}

function bandDistance(value, band) {
  const [low, high] = band;

  if (value >= low && value <= high) {
    return 0;
  }

  return Math.min(Math.abs(value - low), Math.abs(value - high));
}

function resolveTrend(metric, firstValue, latestValue) {
  if (metric.direction === 'band') {
    const firstDistance = bandDistance(firstValue, metric.band);
    const latestDistance = bandDistance(latestValue, metric.band);

    if (latestDistance === firstDistance) {
      return 'unchanged';
    }

    return latestDistance < firstDistance ? 'improved' : 'declined';
  }

  if (latestValue === firstValue) {
    return 'unchanged';
  }

  const improved =
    metric.direction === 'up'
      ? latestValue > firstValue
      : latestValue < firstValue;

  return improved ? 'improved' : 'declined';
}

export function buildComparison(firstAnalysis, latestAnalysis) {
  const metrics = COMPARISON_METRICS.map((metric) => {
    const first = readValue(firstAnalysis, metric.key);
    const latest = readValue(latestAnalysis, metric.key);

    return {
      key: metric.key,
      label: metric.label,
      first,
      latest,
      delta: latest - first,
      trend: resolveTrend(metric, first, latest),
    };
  });

  const overall = metrics.find((metric) => metric.key === 'overall');

  return {
    metrics,
    overallTrend: overall ? overall.trend : 'unchanged',
  };
}

export async function loadAttemptGroup(retryGroup, userId) {
  const sessions = await SpeakingSession.find({
    retryGroup,
    user: userId,
  })
    .populate('topic')
    .sort({ createdAt: 1 })
    .lean();

  if (!sessions.length) {
    return null;
  }

  const analyses = await AnalysisResult.find({
    session: { $in: sessions.map((session) => session._id) },
  }).lean();

  const analysisMap = new Map(
    analyses.map((analysis) => [String(analysis.session), analysis])
  );

  return { sessions, analysisMap };
}