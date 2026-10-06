import mongoose from 'mongoose';

const grammarErrorSchema = new mongoose.Schema(
  {
    original: { type: String, required: true, trim: true },
    correction: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const vocabularyUpgradeSchema = new mongoose.Schema(
  {
    usedWord: { type: String, required: true, trim: true },
    suggestedWord: { type: String, required: true, trim: true },
    meaning: { type: String, required: true, trim: true },
    preferredLanguage: { type: String, required: true, trim: true },
    translation: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    examples: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const analysisResultSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
      required: true,
      unique: true,
    },
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fluency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    vocabulary: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grammar: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    pacing: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fillerCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    wordsPerMinute: {
      type: Number,
      min: 0,
      default: 0,
    },
    vocabularyDiversity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    repeatedPhraseCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    grammarErrors: {
      type: [grammarErrorSchema],
      default: [],
    },
    vocabularyUpgrades: {
      type: [vocabularyUpgradeSchema],
      default: [],
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: 'English',
    },
    improvedAnswer: {
      type: String,
      trim: true,
      default: '',
      maxlength: 10000,
    },
    feedback: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  'AnalysisResult',
  analysisResultSchema
);