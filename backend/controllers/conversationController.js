import Conversation from '../models/Conversation.js';

export async function startConversation(req, res, next) {
  try {
    const { tutor = 'Maya', topic } = req.body;
    const conversation = await Conversation.create({ user: req.user._id, tutor, topic });
    return res.status(201).json({ conversation });
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

    const conversation = await Conversation.findOne({ _id: req.params.conversationId, user: req.user._id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages.push({ role: 'user', content: content.trim() });
    await conversation.save();
    return res.status(201).json({ conversation, service: 'AI conversation service placeholder' });
  } catch (error) {
    return next(error);
  }
}

export async function conversationHistory(req, res, next) {
  try {
    const conversations = await Conversation.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ conversations });
  } catch (error) {
    return next(error);
  }
}
