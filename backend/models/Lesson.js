import mongoose from 'mongoose';

const lessonContentSchema = new mongoose.Schema(
  {
    explanation: { type: String, required: true, trim: true },
    examples: { type: [String], default: [] },
    exercisePrompt: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      enum: ['grammar', 'fluency', 'vocabulary', 'pacing', 'filler', 'repetition'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    content: lessonContentSchema,
    status: {
      type: String,
      enum: ['assigned', 'in-progress', 'completed'],
      default: 'assigned',
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeakingSession',
    },
    scoreBefore: { type: Number, min: 0, max: 100, default: 0 },
    scoreAfter: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

lessonSchema.index({ user: 1, status: 1 });

export default mongoose.model('Lesson', lessonSchema);
