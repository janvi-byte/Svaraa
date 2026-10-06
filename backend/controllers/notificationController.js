import Notification from '../models/Notification.js';
import SpeakingProfile from '../models/SpeakingProfile.js';
import SpeakingSession from '../models/SpeakingSession.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.json({ notification });
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    return next(error);
  }
}

export async function generateNotifications(userId) {
  try {
    const profile = await SpeakingProfile.findOne({ user: userId });
    const sessionCount = await SpeakingSession.countDocuments({
      user: userId,
      status: 'analyzed',
    });

    const existing = await Notification.find({ user: userId })
      .select('type title message')
      .lean();

    const exists = (type, message) =>
      existing.some(
        (n) => n.type === type && n.message === message
      );

    const toCreate = [];

    if (sessionCount >= 3 && profile) {
      if (profile.improvingSkill) {
        const msg = `Your ${profile.improvingSkill} has been improving across recent sessions. Keep it up!`;
        if (!exists('improvement-milestone', msg)) {
          toCreate.push({
            user: userId,
            type: 'improvement-milestone',
            title: 'Skill improvement detected',
            message: msg,
          });
        }
      }

      if (profile.weakestSkill) {
        const msg = `Your ${profile.weakestSkill} needs attention. Try a targeted lesson to improve.`;
        if (!exists('new-weakness', msg)) {
          toCreate.push({
            user: userId,
            type: 'new-weakness',
            title: 'Focus area identified',
            message: msg,
          });
        }
      }
    }

    if (sessionCount === 1) {
      const msg = 'You completed your first speaking practice. Great start!';
      if (!exists('streak-milestone', msg)) {
        toCreate.push({
          user: userId,
          type: 'streak-milestone',
          title: 'First practice completed',
          message: msg,
        });
      }
    }

    if (sessionCount === 5) {
      const msg = 'Five practices done! You are building a real habit.';
      if (!exists('streak-milestone', msg)) {
        toCreate.push({
          user: userId,
          type: 'streak-milestone',
          title: 'Five sessions milestone',
          message: msg,
        });
      }
    }

    if (toCreate.length > 0) {
      await Notification.insertMany(toCreate);
    }
  } catch (error) {
    console.error('Notification generation error:', error.message);
  }
}
