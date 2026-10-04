import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    speakingTimeSeconds: { type: Number, default: 0, min: 0 },
    sessionsCompleted: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    history: [
      {
        date: { type: Date, default: Date.now },
        score: { type: Number, min: 0, max: 100 },
        durationSeconds: { type: Number, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
