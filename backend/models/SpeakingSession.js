import mongoose from 'mongoose';

const speakingSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    transcript: { type: String, trim: true, maxlength: 10000 },
    durationSeconds: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['started', 'submitted', 'analyzed'], default: 'started' },
    retryGroup: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('SpeakingSession', speakingSessionSchema);
