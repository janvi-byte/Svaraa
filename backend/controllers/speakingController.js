import { randomUUID } from 'node:crypto';
import SpeakingSession from '../models/SpeakingSession.js';
import AnalysisResult from '../models/AnalysisResult.js';
import { getRandomTopic } from '../services/topicService.js';
import { getAdaptiveTopic } from '../services/adaptiveService.js';
import { analyzeSpeakingSession } from '../services/analysisService.js';
import { calculateOrUpdateProfile } from '../services/profileService.js';
import { updateVocabularyProfile } from '../services/vocabularyService.js';
import { addAttemptToRetryGroup } from './retryController.js';
import { generateNotifications } from './notificationController.js';
import {
  getPersonalizedTopic,
} from '../services/topicService.js';
import {
  buildComparison,
  loadAttemptGroup,
} from '../services/attemptService.js';
import { getSpeakingProfile } from '../services/profileService.js';
import Topic from '../models/Topic.js';
import SpeakingProfile from '../models/SpeakingProfile.js';

export async function randomTopic(req, res) {
  try {
    const { excludeTopicId, adaptive } = req.query;

    let topic;

    if (adaptive === 'true') {
      const profile = await SpeakingProfile.findOne({ user: req.user._id });
      if (profile && profile.sessionsAnalyzed >= 3) {
        topic = await getAdaptiveTopic(req.user._id, excludeTopicId || null);
      } else {
        topic = await getRandomTopic(excludeTopicId || null);
      }
    } else {
      topic = await getRandomTopic(excludeTopicId || null);
    }

    return res.json({ topic });
  } catch (error) {
    console.error('Random topic error:', error);
    return res.status(500).json({
      message: 'Failed to load a speaking topic.',
    });
  }
}

export async function nextChallengeTopic(req, res) {
  try {
    const { excludeTopicId } = req.query;

    const result = await getPersonalizedTopic(
      req.user._id,
      excludeTopicId || null
    );

    return res.json(result);
  } catch (error) {
    console.error('Next challenge error:', error);

    return res.status(500).json({
      message: 'Failed to load your next challenge.',
    });
  }
}

export async function speakingProfile(req, res) {
  try {
    const profile = await getSpeakingProfile(req.user._id);

    return res.json({ profile });
  } catch (error) {
    console.error('Speaking profile error:', error);

    return res.status(500).json({
      message: 'Failed to load your speaking profile.',
    });
  }
}

export async function startSpeakingSession(req, res) {
  try {
    const { topicId, retryGroup } = req.body;

    if (!topicId) {
      return res.status(400).json({
        message: 'topicId is required.',
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        message: 'Speaking topic not found.',
      });
    }

    let group = randomUUID();

    if (
      retryGroup !== undefined &&
      retryGroup !== null &&
      retryGroup !== ''
    ) {
      if (typeof retryGroup !== 'string' || !retryGroup.trim()) {
        return res.status(400).json({
          message: 'retryGroup must reference a previous attempt.',
        });
      }

      group = retryGroup.trim();

      const existingAttempt = await SpeakingSession.findOne({
        retryGroup: group,
        user: req.user._id,
      });

      if (!existingAttempt) {
        return res.status(400).json({
          message: 'The retry session was not found.',
        });
      }

      if (String(existingAttempt.topic) !== String(topic._id)) {
        return res.status(400).json({
          message: 'Retry attempts must use the same speaking topic.',
        });
      }
    }

    const session = await SpeakingSession.create({
      user: req.user._id,
      topic: topic._id,
      status: 'started',
      retryGroup: group,
    });

    return res.status(201).json({ session });
  } catch (error) {
    console.error('Start speaking session error:', error);
    return res.status(500).json({
      message: 'Failed to start speaking session.',
    });
  }
}

export async function submitSpeakingSession(req, res) {
  try {
    const { sessionId } = req.params;
    const {
      transcript,
      durationSeconds,
      preferredLanguage = 'English',
    } = req.body;

    if (!transcript?.trim()) {
      return res.status(400).json({
        message: 'Transcript is required.',
      });
    }

    const session = await SpeakingSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: 'Speaking session not found.',
      });
    }

    session.transcript = transcript.trim();
    session.durationSeconds = Number(durationSeconds) || 0;
    session.status = 'submitted';

    await session.save();

    const analysis = await analyzeSpeakingSession(
      session,
      preferredLanguage
    );

    if (analysis.status !== 'complete') {
      return res.status(200).json({
        session,
        analysis,
      });
    }

    const savedAnalysis = await AnalysisResult.findOneAndUpdate(
      { session: session._id },
      {
        session: session._id,
        overall: analysis.overall,
        fluency: analysis.fluency,
        vocabulary: analysis.vocabulary,
        grammar: analysis.grammar,
        pacing: analysis.pacing,
        fillerCount: analysis.filler_count,
        wordsPerMinute: analysis.words_per_minute,
        vocabularyDiversity: analysis.vocabulary_diversity,
        repeatedPhraseCount: analysis.repeated_phrase_count,
        grammarErrors: analysis.grammar_errors || [],
        vocabularyUpgrades: analysis.vocabulary_upgrades || [],
        preferredLanguage:
          analysis.preferred_language || preferredLanguage,
        improvedAnswer: analysis.improved_answer || '',
        feedback: analysis.feedback || [],
        strengths: analysis.strengths || [],
        status: 'complete',
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    session.status = 'analyzed';
    await session.save();

    try {
      await calculateOrUpdateProfile(req.user._id);
      await updateVocabularyProfile(req.user._id, session.transcript);
      await addAttemptToRetryGroup(
        req.user._id,
        session.topic,
        session,
        savedAnalysis
      );
      await generateNotifications(req.user._id);
    } catch (profileError) {
      console.error('Profile update error:', profileError.message);
    }

    return res.json({
      session,
      analysis: savedAnalysis,
      service: 'speakora-ai',
    });
  } catch (error) {
    console.error('Submit speaking session error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to analyze speaking session.',
    });
  }
}

export async function speakingHistory(req, res) {
  try {
    const sessions = await SpeakingSession.find({
      user: req.user._id,
    })
      .populate('topic')
      .sort({ createdAt: -1 })
      .lean();

    const sessionIds = sessions.map((session) => session._id);

    const analyses = await AnalysisResult.find({
      session: { $in: sessionIds },
    }).lean();

    const analysisMap = new Map(
      analyses.map((analysis) => [
        String(analysis.session),
        analysis,
      ])
    );

    const sessionsWithAnalysis = sessions.map((session) => ({
      ...session,
      analysis: analysisMap.get(String(session._id)) || null,
    }));

    return res.json({
      sessions: sessionsWithAnalysis,
    });
  } catch (error) {
    console.error('Speaking history error:', error);

    return res.status(500).json({
      message: 'Failed to load speaking history.',
    });
  }
}

export async function analyzeSpeaking(req, res) {
  try {
    const {
      transcript,
      durationSeconds = 0,
      preferredLanguage = 'English',
    } = req.body;

    if (!transcript?.trim()) {
      return res.status(400).json({
        message: 'Transcript is required.',
      });
    }

    const result = await analyzeSpeakingSession(
      {
        transcript: transcript.trim(),
        durationSeconds: Number(durationSeconds) || 0,
      },
      preferredLanguage
    );

    return res.json(result);
  } catch (error) {
    console.error('Analyze speaking error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to analyze transcript.',
    });
  }
}

export async function getRetryAttempts(req, res) {
  try {
    const { retryGroup } = req.params;

    const group = await loadAttemptGroup(retryGroup, req.user._id);

    if (!group) {
      return res.status(404).json({
        message: 'No attempts were found for this retry session.',
      });
    }

    const attempts = group.sessions.map((session) => ({
      ...session,
      analysis: group.analysisMap.get(String(session._id)) || null,
    }));

    return res.json({
      retryGroup,
      attemptCount: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error('Retry attempts error:', error);

    return res.status(500).json({
      message: 'Failed to load retry attempts.',
    });
  }
}

export async function compareRetryAttempts(req, res) {
  try {
    const { retryGroup } = req.params;

    const group = await loadAttemptGroup(retryGroup, req.user._id);

    if (!group) {
      return res.status(404).json({
        message: 'No attempts were found for this retry session.',
      });
    }

    const analyzedSessions = group.sessions.filter((session) => {
      const analysis = group.analysisMap.get(String(session._id));
      return analysis && analysis.status === 'complete';
    });

    const attemptNumber = (session) =>
      group.sessions.findIndex(
        (item) => String(item._id) === String(session._id)
      ) + 1;

    if (analyzedSessions.length < 2) {
      return res.json({
        retryGroup,
        attemptCount: group.sessions.length,
        analyzedAttemptCount: analyzedSessions.length,
        firstAttempt: null,
        latestAttempt: null,
        comparison: null,
        overallTrend: null,
      });
    }

    const firstSession = analyzedSessions[0];
    const latestSession =
      analyzedSessions[analyzedSessions.length - 1];

    const result = buildComparison(
      group.analysisMap.get(String(firstSession._id)),
      group.analysisMap.get(String(latestSession._id))
    );

    return res.json({
      retryGroup,
      attemptCount: group.sessions.length,
      analyzedAttemptCount: analyzedSessions.length,
      firstAttempt: {
        sessionId: String(firstSession._id),
        attemptNumber: attemptNumber(firstSession),
        createdAt: firstSession.createdAt,
      },
      latestAttempt: {
        sessionId: String(latestSession._id),
        attemptNumber: attemptNumber(latestSession),
        createdAt: latestSession.createdAt,
      },
      comparison: result.metrics,
      overallTrend: result.overallTrend,
    });
  } catch (error) {
    console.error('Retry comparison error:', error);

    return res.status(500).json({
      message: 'Failed to compare retry attempts.',
    });
  }
}