import mongoose from 'mongoose';

const analysisResultSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingSession', required: true, unique: true },
    fluency: { type: Number, min: 0, max: 100, default: 0 },
    vocabulary: { type: Number, min: 0, max: 100, default: 0 },
    grammar: { type: Number, min: 0, max: 100, default: 0 },
    pronunciation: { type: Number, min: 0, max: 100, default: 0 },
    feedback: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('AnalysisResult', analysisResultSchema);
