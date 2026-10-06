import RetryGroup from '../models/RetryGroup.js';
import SpeakingSession from '../models/SpeakingSession.js';
import Topic from '../models/Topic.js';

export async function startRetry(req, res, next) {
  try {
    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ message: 'topicId is required.' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    const session = await SpeakingSession.create({
      user: req.user._id,
      topic: topic._id,
      status: 'started',
    });

    let retryGroup = await RetryGroup.findOne({
      user: req.user._id,
      topic: topicId,
    });

    if (!retryGroup) {
      retryGroup = await RetryGroup.create({
        user: req.user._id,
        topic: topicId,
        attempts: [],
      });
    }

    return res.status(201).json({ session, retryGroup });
  } catch (error) {
    return next(error);
  }
}

export async function getRetryComparison(req, res, next) {
  try {
    const { retryGroupId } = req.params;
    const retryGroup = await RetryGroup.findOne({
      _id: retryGroupId,
      user: req.user._id,
    });

    if (!retryGroup) {
      return res.status(404).json({ message: 'Retry group not found.' });
    }

    const attempts = retryGroup.attempts || [];
    if (attempts.length < 2) {
      return res.json({
        retryGroup,
        comparison: null,
        message: 'Complete at least two attempts to see a comparison.',
      });
    }

    const first = attempts[0];
    const last = attempts[attempts.length - 1];
    const skills = ['overall', 'fluency', 'vocabulary', 'grammar', 'pacing'];
    const changes = {};
    for (const skill of skills) {
      changes[skill] = (last[skill] || 0) - (first[skill] || 0);
    }
    changes.fillerCount = (first.fillerCount || 0) - (last.fillerCount || 0);
    changes.wordsPerMinute = (last.wordsPerMinute || 0) - (first.wordsPerMinute || 0);
    changes.vocabularyDiversity = (last.vocabularyDiversity || 0) - (first.vocabularyDiversity || 0);
    changes.repeatedPhraseCount = (first.repeatedPhraseCount || 0) - (last.repeatedPhraseCount || 0);

    return res.json({
      retryGroup,
      comparison: {
        firstAttempt: first,
        lastAttempt: last,
        changes,
        attemptCount: attempts.length,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRetryHistory(req, res, next) {
  try {
    const retryGroups = await RetryGroup.find({
      user: req.user._id,
      'attempts.1': { $exists: true },
    })
      .populate('topic')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ retryGroups });
  } catch (error) {
    return next(error);
  }
}

export async function addAttemptToRetryGroup(userId, topicId, session, analysis) {
  if (!session || !analysis) return;
  let retryGroup = await RetryGroup.findOne({ user: userId, topic: topicId });
  if (!retryGroup) {
    retryGroup = await RetryGroup.create({
      user: userId,
      topic: topicId,
      attempts: [],
    });
  }
  retryGroup.attempts.push({
    session: session._id,
    transcript: session.transcript || '',
    overall: analysis.overall || 0,
    fluency: analysis.fluency || 0,
    vocabulary: analysis.vocabulary || 0,
    grammar: analysis.grammar || 0,
    pacing: analysis.pacing || 0,
    fillerCount: analysis.fillerCount || 0,
    wordsPerMinute: analysis.wordsPerMinute || 0,
    vocabularyDiversity: analysis.vocabularyDiversity || 0,
    repeatedPhraseCount: analysis.repeatedPhraseCount || 0,
    durationSeconds: session.durationSeconds || 0,
    createdAt: new Date(),
  });
  await retryGroup.save();
  return retryGroup;
}
