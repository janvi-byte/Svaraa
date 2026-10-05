import mongoose from 'mongoose';

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

export default mongoose.model('AnalysisResult', analysisResultSchema);