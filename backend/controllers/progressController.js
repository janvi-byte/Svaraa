import Progress from '../models/Progress.js';

export async function getProgress(req, res, next) {
  try {
    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    );
    return res.json({ progress });
  } catch (error) {
    return next(error);
  }
}
