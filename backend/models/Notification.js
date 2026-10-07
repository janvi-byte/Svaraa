import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'practice-reminder',
        'streak-milestone',
        'improvement-milestone',
        'new-weakness',
        'vocabulary-goal',
        'lesson-assigned',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    eventKey: { type: String, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index(
  { user: 1, eventKey: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('Notification', notificationSchema);
