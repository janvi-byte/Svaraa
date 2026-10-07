import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, minlength: 8, select: false },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'both'],
      default: 'local',
    },
    googleSubjectId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    emailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },
    preferredLanguage: { type: String, default: 'English' },
    practiceGoal: { type: String, default: 'Everyday confidence' },
    preferredTutor: {
      type: String,
      enum: ['Maya', 'James', 'Priya'],
      default: 'Maya',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
