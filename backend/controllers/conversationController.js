import Conversation from '../models/Conversation.js';
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
    const { content } = req.body;
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
