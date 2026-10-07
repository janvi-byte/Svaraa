import mongoose from 'mongoose';

const vocabularyEntrySchema = new mongoose.Schema(
  {
    word: { type: String, required: true, lowercase: true, trim: true },
    count: { type: Number, default: 1, min: 1 },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const vocabularyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalWordsUsed: { type: Number, default: 0, min: 0 },
    words: [vocabularyEntrySchema],
    processedSessionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpeakingSession',
        select: false,
      },
    ],
    targetWords: [
      {
        word: { type: String, required: true, lowercase: true, trim: true },
        introducedAt: { type: Date, default: Date.now },
        practicedCount: { type: Number, default: 0, min: 0 },
        improvedCount: { type: Number, default: 0, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

vocabularyProfileSchema.index({ user: 1 });

export default mongoose.model('VocabularyProfile', vocabularyProfileSchema);
