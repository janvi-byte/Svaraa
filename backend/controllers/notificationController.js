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

    const candidates = [];

    if (sessionCount >= 3 && profile) {
      if (profile.improvingSkill) {
        const msg = `Your ${profile.improvingSkill} has been improving across recent sessions. Keep it up!`;
        candidates.push({
          eventKey: `improvement:${profile.improvingSkill}`,
          type: 'improvement-milestone',
          title: 'Skill improvement detected',
          message: msg,
        });
      }

      if (profile.weakestSkill) {
        const msg = `Your ${profile.weakestSkill} needs attention. Try a targeted lesson to improve.`;
        candidates.push({
          eventKey: `weakness:${profile.weakestSkill}`,
          type: 'new-weakness',
          title: 'Focus area identified',
          message: msg,
        });
      }
    }

    if (sessionCount === 1) {
      candidates.push({
        eventKey: 'practice-first',
        type: 'streak-milestone',
        title: 'First practice completed',
        message: 'You completed your first speaking practice. Great start!',
      });
    }

    if (sessionCount === 5) {
      candidates.push({
        eventKey: 'sessions-5',
        type: 'streak-milestone',
        title: 'Five sessions milestone',
        message: 'Five practices done! You are building a real habit.',
      });
    }

    for (const candidate of candidates) {
      const legacyNotification = await Notification.exists({
        user: userId,
        type: candidate.type,
        message: candidate.message,
        eventKey: { $exists: false },
      });

      if (legacyNotification) {
        continue;
      }

      try {
        await Notification.updateOne(
          { user: userId, eventKey: candidate.eventKey },
          {
            $setOnInsert: {
              user: userId,
              type: candidate.type,
              title: candidate.title,
              message: candidate.message,
              eventKey: candidate.eventKey,
            },
          },
          { upsert: true }
        );
      } catch (error) {
        if (error?.code !== 11000) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Notification generation error:', error.message);
  }
}
