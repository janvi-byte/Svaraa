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
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
