import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { _id: false, timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: String, default: 'Maya' },
    topic: { type: String, trim: true },
    mode: {
      type: String,
      enum: ['conversation', 'roleplay', 'debate'],
      default: 'conversation',
    },
    scenario: { type: String, trim: true },
    debateTopic: { type: String, trim: true },
    debatePosition: { type: String, enum: ['for', 'against'], default: 'for' },
    roleplaySession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
    },
    spokenDurationSeconds: { type: Number, min: 0, default: 0 },
    completedAt: { type: Date },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
