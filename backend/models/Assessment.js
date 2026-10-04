import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    confidenceGoal: { type: String, required: true },
    speakingFrequency: { type: String, required: true },
    practicePreference: { type: String, required: true },
    baselineScores: {
      fluency: { type: Number, default: 0, min: 0, max: 100 },
      vocabulary: { type: Number, default: 0, min: 0, max: 100 },
      grammar: { type: Number, default: 0, min: 0, max: 100 },
      pronunciation: { type: Number, default: 0, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
