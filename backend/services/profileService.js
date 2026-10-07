import SpeakingProfile from '../models/SpeakingProfile.js';
import AnalysisResult from '../models/AnalysisResult.js';
import SpeakingSession from '../models/SpeakingSession.js';

const SKILLS = ['grammar', 'fluency', 'vocabulary', 'pacing'];
const PROFILE_METRICS = [
  'overall',
  ...SKILLS,
  'fillerCount',
  'wordsPerMinute',
  'vocabularyDiversity',
  'repeatedPhraseCount',
];
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

function averageField(sessions, field) {
  if (!sessions.length) {
    return 0;
  }

  return sessions.reduce((sum, session) => {
    const value = Number(session.analysis[field]);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0) / sessions.length;
}

function deriveDifficulty(recentAverage) {
  if (recentAverage >= 85) {
    return 'Hard';
  }

  if (recentAverage >= 70) {
    return 'Medium';
  }

  return 'Easy';
}

function toPublicProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    _id: profile._id,
    user: profile.user,
    sessionsAnalyzed: profile.sessionsAnalyzed,
    averageOverall: profile.avgOverall,
    averageGrammar: profile.avgGrammar,
    averageFluency: profile.avgFluency,
    averageVocabulary: profile.avgVocabulary,
    averagePacing: profile.avgPacing,
    averageWordsPerMinute: profile.avgWpm,
    averageFillerCount: profile.avgFillerCount,
    averageVocabularyDiversity: profile.avgVocabularyDiversity,
    averageRepeatedPhraseCount: profile.avgRepeatedPhraseCount,
    strongestSkill: profile.strongestSkill,
    weakestSkill: profile.weakestSkill,
    improvingSkill: profile.improvingSkill,
    decliningSkill: profile.decliningSkill,
    difficulty: profile.currentDifficulty,
    recentScoreTrend: profile.recentScoreTrend,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
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
          recentScoreTrend: '',
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
    .filter((s) => {
      if (!s.analysis || s.analysis.status !== 'complete') {
        return false;
      }

      return PROFILE_METRICS.every((field) =>
        Number.isFinite(Number(s.analysis[field]))
      );
    });

  const count = sessionsWithAnalysis.length;
  const avg = (field) => averageField(sessionsWithAnalysis, field);

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
  let recentScoreTrend = '';

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

    const olderOverall = olderSessions.reduce((sum, s) => sum + (s.analysis.overall || 0), 0) / olderSessions.length;
    const recentOverall = recentSessions.reduce((sum, s) => sum + (s.analysis.overall || 0), 0) / recentSessions.length;
    const overallDelta = Math.round(recentOverall - olderOverall);
    if (overallDelta >= 5) {
      recentScoreTrend = 'improving';
    } else if (overallDelta <= -5) {
      recentScoreTrend = 'declining';
    } else {
      recentScoreTrend = 'stable';
    }
  }

  let currentDifficulty = deriveDifficulty(
    averageField(
      sessionsWithAnalysis.slice(-Math.min(5, count)),
      'overall'
    )
  );

  if (count >= MIN_SESSIONS_FOR_ADAPTIVE) {
    const recentN = Math.min(5, count);
    const recent = sessionsWithAnalysis.slice(-recentN);
    const recentAvgOverall = averageField(recent, 'overall');
    currentDifficulty = deriveDifficulty(recentAvgOverall);
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

export async function getSpeakingProfile(userId) {
  const profile = await calculateOrUpdateProfile(userId);
  return toPublicProfile(profile);
}
