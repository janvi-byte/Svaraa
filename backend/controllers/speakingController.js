import AnalysisResult from '../models/AnalysisResult.js';
import SpeakingSession from '../models/SpeakingSession.js';
import { analyzeSpeakingSession } from '../services/analysisService.js';
import { getRandomTopic } from '../services/topicService.js';

export async function randomTopic(req, res, next) {
  try {
    return res.json({ topic: await getRandomTopic() });
  } catch (error) {
    return next(error);
  }
}

export async function startSpeakingSession(req, res, next) {
  try {
    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ message: 'topicId is required' });
    }
    const session = await SpeakingSession.create({ user: req.user._id, topic: topicId });
    return res.status(201).json({ session });
  } catch (error) {
    return next(error);
  }
}

export async function submitSpeakingSession(req, res, next) {
  try {
    const { transcript, durationSeconds = 0 } = req.body;
    const session = await SpeakingSession.findOneAndUpdate(
      { _id: req.params.sessionId, user: req.user._id },
      { transcript, durationSeconds, status: 'submitted' },
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ message: 'Speaking session not found' });
    }

    const analysis = await analyzeSpeakingSession(session);
    const result = await AnalysisResult.findOneAndUpdate(
      { session: session._id },
      { session: session._id, status: analysis.status },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json({ session, analysis: result, service: analysis.message });
  } catch (error) {
    return next(error);
  }
}

export async function speakingHistory(req, res, next) {
  try {
    const sessions = await SpeakingSession.find({ user: req.user._id }).populate('topic').sort({ createdAt: -1 });
    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
}
