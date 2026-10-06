import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
      required: true,
    },
    transcript: { type: String, trim: true, default: '' },
    overall: { type: Number, min: 0, max: 100, default: 0 },
    fluency: { type: Number, min: 0, max: 100, default: 0 },
    vocabulary: { type: Number, min: 0, max: 100, default: 0 },
    grammar: { type: Number, min: 0, max: 100, default: 0 },
    pacing: { type: Number, min: 0, max: 100, default: 0 },
    fillerCount: { type: Number, min: 0, default: 0 },
    wordsPerMinute: { type: Number, min: 0, default: 0 },
    vocabularyDiversity: { type: Number, min: 0, max: 100, default: 0 },
    repeatedPhraseCount: { type: Number, min: 0, default: 0 },
    durationSeconds: { type: Number, min: 0, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const retryGroupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    attempts: { type: [attemptSchema], default: [] },
  },
  { timestamps: true }
);

retryGroupSchema.index({ user: 1, topic: 1 });

export default mongoose.model('RetryGroup', retryGroupSchema);
