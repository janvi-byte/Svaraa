import SpeakingProfile from '../models/SpeakingProfile.js';
import AnalysisResult from '../models/AnalysisResult.js';
import SpeakingSession from '../models/SpeakingSession.js';

const SKILLS = ['grammar', 'fluency', 'vocabulary', 'pacing'];
const DIFFICULTY_ORDER = ['Easy', 'Medium', 'Hard'];
const MIN_SESSIONS_FOR_ADAPTIVE = 3;
const MIN_SESSIONS_FOR_TREND = 5;

function roundScore(value) {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function computeTrends(recentSessions, olderSessions) {
  const trends = {};
  for (const skill of SKILLS) {
    const recentAvg = recentSessions.length
      ? recentSessions.reduce((sum, s) => sum + (s.analysis[skill] || 0), 0) /
        recentSessions.length
      : 0;
    const olderAvg = olderSessions.length
      ? olderSessions.reduce((sum, s) => sum + (s.analysis[skill] || 0), 0) /
        olderSessions.length
      : 0;
    if (olderAvg === 0 && recentAvg === 0) {
      trends[skill] = 0;
    } else if (olderAvg === 0) {
      trends[skill] = recentAvg;
    } else {
      trends[skill] = Math.round(recentAvg - olderAvg);
    }
  }
  return trends;
}

export async function calculateOrUpdateProfile(userId) {
  const sessions = await SpeakingSession.find({
    user: userId,
    status: 'analyzed',
  })
    .populate('topic')
    .sort({ createdAt: 1 })
    .lean();

  const sessionIds = sessions.map((s) => s._id);
  const analyses = await AnalysisResult.find({
    session: { $in: sessionIds },
    status: 'complete',
  }).lean();

  if (!analyses.length) {
    return SpeakingProfile.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: { user: userId },
        $set: {
          sessionsAnalyzed: 0,
          avgOverall: 0,
          avgGrammar: 0,
          avgFluency: 0,
          avgVocabulary: 0,
          avgPacing: 0,
          avgFillerCount: 0,
          avgWpm: 0,
          avgVocabularyDiversity: 0,
          avgRepeatedPhraseCount: 0,
          strongestSkill: '',
          weakestSkill: '',
          improvingSkill: '',
          decliningSkill: '',
          currentDifficulty: 'Easy',
          recentTopics: [],
          recentScores: [],
          lastUpdatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );
  }

  const analysisMap = new Map(analyses.map((a) => [String(a.session), a]));
  const sessionsWithAnalysis = sessions
    .map((s) => ({ ...s, analysis: analysisMap.get(String(s._id)) }))
    .filter((s) => s.analysis);

  const count = sessionsWithAnalysis.length;
  const avg = (field) =>
    sessionsWithAnalysis.reduce((sum, s) => sum + (s.analysis[field] || 0), 0) /
    count;

  const avgOverall = roundScore(avg('overall'));
  const avgGrammar = roundScore(avg('grammar'));
  const avgFluency = roundScore(avg('fluency'));
  const avgVocabulary = roundScore(avg('vocabulary'));
  const avgPacing = roundScore(avg('pacing'));

  const skillAverages = {
    grammar: avgGrammar,
    fluency: avgFluency,
    vocabulary: avgVocabulary,
    pacing: avgPacing,
  };

  let strongestSkill = SKILLS[0];
  let weakestSkill = SKILLS[0];
  for (const skill of SKILLS) {
    if (skillAverages[skill] > skillAverages[strongestSkill]) {
      strongestSkill = skill;
    }
    if (skillAverages[skill] < skillAverages[weakestSkill]) {
      weakestSkill = skill;
    }
  }

  let improvingSkill = '';
  let decliningSkill = '';

  if (count >= MIN_SESSIONS_FOR_TREND) {
    const midpoint = Math.floor(count / 2);
    const olderSessions = sessionsWithAnalysis.slice(0, midpoint);
    const recentSessions = sessionsWithAnalysis.slice(midpoint);
    const trends = computeTrends(recentSessions, olderSessions);
    let maxImprovement = 0;
    let maxDecline = 0;
    for (const skill of SKILLS) {
      if (trends[skill] > maxImprovement) {
        maxImprovement = trends[skill];
        improvingSkill = skill;
      }
      if (trends[skill] < maxDecline) {
        maxDecline = trends[skill];
        decliningSkill = skill;
      }
    }
  }

  let currentDifficulty = 'Easy';
  if (count >= MIN_SESSIONS_FOR_ADAPTIVE) {
    const recentN = Math.min(5, count);
    const recent = sessionsWithAnalysis.slice(-recentN);
    const recentAvgOverall =
      recent.reduce((sum, s) => sum + (s.analysis.overall || 0), 0) / recentN;
    const currentIdx = DIFFICULTY_ORDER.indexOf(
      skillAverages[strongestSkill] >= 85
        ? 'Hard'
        : recentAvgOverall >= 75
          ? 'Medium'
          : 'Easy'
    );
    if (recentAvgOverall >= 80 && currentIdx < DIFFICULTY_ORDER.length - 1) {
      currentDifficulty = DIFFICULTY_ORDER[currentIdx + 1];
    } else if (recentAvgOverall < 50 && currentIdx > 0) {
      currentDifficulty = DIFFICULTY_ORDER[currentIdx - 1];
    } else {
      currentDifficulty = DIFFICULTY_ORDER[currentIdx];
    }
  }

  const recentTopics = sessionsWithAnalysis
    .slice(-10)
    .map((s) => s.topic?._id)
    .filter(Boolean);

  const recentScores = SKILLS.map((skill) => ({
    skill,
    score: skillAverages[skill],
    sampleCount: count,
  }));

  return SpeakingProfile.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId },
      $set: {
        sessionsAnalyzed: count,
        avgOverall,
        avgGrammar,
        avgFluency,
        avgVocabulary,
        avgPacing,
        avgFillerCount: Math.round(avg('fillerCount')),
        avgWpm: Math.round(avg('wordsPerMinute')),
        avgVocabularyDiversity: roundScore(avg('vocabularyDiversity')),
        avgRepeatedPhraseCount: Math.round(avg('repeatedPhraseCount')),
        strongestSkill,
        weakestSkill,
        improvingSkill,
        decliningSkill,
        currentDifficulty,
        recentTopics,
        recentScores,
        lastUpdatedAt: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true }
  );
}

export async function getProfile(userId) {
  return calculateOrUpdateProfile(userId);
}
