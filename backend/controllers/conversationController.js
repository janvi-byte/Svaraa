import Conversation from '../models/Conversation.js';
import SpeakingSession from '../models/SpeakingSession.js';
import AnalysisResult from '../models/AnalysisResult.js';
import { analyzeSpeakingSession } from '../services/analysisService.js';
import { calculateOrUpdateProfile } from '../services/profileService.js';
import { updateVocabularyProfileForSession } from '../services/vocabularyService.js';
import { generateNotifications } from './notificationController.js';
import { generateAIResponse, TUTOR_PERSONAS, ROLEPLAY_SCENARIOS, DEBATE_TOPICS } from '../services/conversationAIService.js';

export async function startConversation(req, res, next) {
  try {
    const {
      tutor = 'Maya',
      topic,
      mode = 'conversation',
      scenario,
      debateTopic,
      debatePosition,
    } = req.body;

    const conversation = await Conversation.create({
      user: req.user._id,
      tutor,
      topic,
      mode,
      scenario,
      debateTopic,
      debatePosition,
    });

    let aiReply = '';
    if (mode === 'roleplay' || mode === 'debate' || conversation.messages.length === 0) {
      aiReply = await generateAIResponse(conversation, '', {
        tutor,
        mode,
        scenario,
        debateTopic,
        debatePosition,
      });

      conversation.messages.push({ role: 'assistant', content: aiReply });
      await conversation.save();
    }

    return res.status(201).json({ conversation, aiReply });
  } catch (error) {
    return next(error);
  }
}

export async function addMessage(req, res, next) {
  try {
    const { content, durationSeconds } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages.push({ role: 'user', content: content.trim() });
    if (
      (
        conversation.mode === 'roleplay' ||
        conversation.mode === 'debate' ||
        conversation.mode === 'conversation'
      ) &&
      Number.isFinite(Number(durationSeconds))
    ) {
      conversation.spokenDurationSeconds += Math.max(0, Number(durationSeconds));
    }
    await conversation.save();

    const aiReply = await generateAIResponse(conversation, content.trim(), {
      tutor: conversation.tutor,
      mode: conversation.mode || 'conversation',
      scenario: conversation.scenario,
      debateTopic: conversation.debateTopic,
      debatePosition: conversation.debatePosition,
    });

    conversation.messages.push({ role: 'assistant', content: aiReply });
    await conversation.save();

    return res.json({ conversation, aiReply });
  } catch (error) {
    return next(error);
  }
}

export async function completeRoleplay(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (
      conversation.mode !== 'roleplay' &&
      conversation.mode !== 'debate' &&
      conversation.mode !== 'conversation'
    ) {
      return res.status(400).json({
        message: 'Only conversation, roleplay, or debate sessions can be completed here.',
      });
    }

    if (conversation.roleplaySession) {
      const existingAnalysis = await AnalysisResult.findOne({
        session: conversation.roleplaySession,
        status: 'complete',
      });
      if (existingAnalysis) {
        const session = await SpeakingSession.findById(conversation.roleplaySession);
        await generateNotifications(req.user._id);
        const vocabularyResult = session
          ? await updateVocabularyProfileForSession(
            req.user._id,
            session._id,
            session.transcript
          )
          : null;
        return res.json({
          conversation,
          session,
          analysis: existingAnalysis,
          vocabulary: vocabularyResult?.summary,
        });
      }
    }

    const spokenMessages = conversation.messages
      .filter((message) => message.role === 'user' && message.content.trim())
      .map((message) => message.content.trim());

    if (!spokenMessages.length) {
      return res.status(400).json({ message: 'At least one spoken turn is required.' });
    }

    let session = conversation.roleplaySession
      ? await SpeakingSession.findOne({
        _id: conversation.roleplaySession,
        user: req.user._id,
      })
      : null;

    if (!session) {
      session = await SpeakingSession.create({
        user: req.user._id,
        transcript: spokenMessages.join('\n\n'),
        durationSeconds: conversation.spokenDurationSeconds || 0,
        status: 'submitted',
      });
      const claimedConversation = await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          user: req.user._id,
          roleplaySession: { $exists: false },
        },
        { $set: { roleplaySession: session._id } },
        { new: true }
      );
      if (!claimedConversation) {
        await SpeakingSession.deleteOne({ _id: session._id, user: req.user._id });
        const currentConversation = await Conversation.findOne({
          _id: conversation._id,
          user: req.user._id,
        });
        session = currentConversation?.roleplaySession
          ? await SpeakingSession.findOne({
            _id: currentConversation.roleplaySession,
            user: req.user._id,
          })
          : null;
      }
      if (!session) {
        return res.status(409).json({ message: 'Roleplay completion is already in progress.' });
      }
    } else {
      session.transcript = spokenMessages.join('\n\n');
      session.durationSeconds = conversation.spokenDurationSeconds || 0;
      session.status = 'submitted';
      await session.save();
    }

    const analysis = await analyzeSpeakingSession(session);
    if (analysis.status !== 'complete') {
      return res.status(503).json({
        message: analysis.message || 'Roleplay analysis is unavailable.',
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
          preferredLanguage: analysis.preferred_language || 'English',
          improvedAnswer: analysis.improved_answer || '',
          feedback: analysis.feedback || [],
          strengths: analysis.strengths || [],
          status: 'complete',
        },
        { new: true, upsert: true, runValidators: true }
      );

      session.status = 'analyzed';
      await session.save();
      conversation.completedAt = new Date();
      await conversation.save();
      await calculateOrUpdateProfile(req.user._id);
      await generateNotifications(req.user._id);
      const vocabularyResult = await updateVocabularyProfileForSession(
        req.user._id,
        session._id,
        session.transcript
      );

    return res.json({
      conversation,
      session,
      analysis: savedAnalysis,
      vocabulary: vocabularyResult.summary,
    });
  } catch (error) {
    return next(error);
  }
}

export async function conversationHistory(req, res, next) {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ conversations });
  } catch (error) {
    return next(error);
  }
}

export async function getTutors(req, res, next) {
  try {
    const tutors = Object.entries(TUTOR_PERSONAS).map(([name, data]) => ({
      name,
      style: data.style,
    }));
    const scenarios = Object.entries(ROLEPLAY_SCENARIOS).map(([id, data]) => ({
      id,
      label: data.label,
    }));
    return res.json({ tutors, scenarios, debateTopics: DEBATE_TOPICS });
  } catch (error) {
    return next(error);
  }
}
