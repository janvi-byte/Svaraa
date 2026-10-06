import mongoose from 'mongoose';

const skillScoreSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing'],
      required: true,
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    sampleCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const speakingProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    sessionsAnalyzed: { type: Number, default: 0, min: 0 },
    avgOverall: { type: Number, default: 0, min: 0, max: 100 },
    avgGrammar: { type: Number, default: 0, min: 0, max: 100 },
    avgFluency: { type: Number, default: 0, min: 0, max: 100 },
    avgVocabulary: { type: Number, default: 0, min: 0, max: 100 },
    avgPacing: { type: Number, default: 0, min: 0, max: 100 },
    avgFillerCount: { type: Number, default: 0, min: 0 },
    avgWpm: { type: Number, default: 0, min: 0 },
    avgVocabularyDiversity: { type: Number, default: 0, min: 0, max: 100 },
    avgRepeatedPhraseCount: { type: Number, default: 0, min: 0 },
    strongestSkill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing', ''],
      default: '',
    },
    weakestSkill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing', ''],
      default: '',
    },
    improvingSkill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing', ''],
      default: '',
    },
    decliningSkill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing', ''],
      default: '',
    },
    currentDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    recentTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    recentScores: [skillScoreSchema],
    recentScoreTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining', ''],
      default: '',
    },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

speakingProfileSchema.index({ user: 1 });

export default mongoose.model('SpeakingProfile', speakingProfileSchema);
