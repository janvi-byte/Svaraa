import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    prompt: { type: String, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    durationSeconds: { type: Number, default: 60, min: 15 },
    category: { type: String, default: 'General' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Topic', topicSchema);
