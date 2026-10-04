import Assessment from '../models/Assessment.js';

export async function startAssessment(req, res) {
  const latest = await Assessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ assessment: latest, status: latest ? 'ready_to_update' : 'not_started' });
}

export async function submitAssessment(req, res, next) {
  try {
    const { confidenceGoal, speakingFrequency, practicePreference } = req.body;
    if (!confidenceGoal || !speakingFrequency || !practicePreference) {
      return res.status(400).json({ message: 'All assessment answers are required' });
    }

    const assessment = await Assessment.create({
      user: req.user._id,
      confidenceGoal,
      speakingFrequency,
      practicePreference,
    });
    return res.status(201).json({ assessment });
  } catch (error) {
    return next(error);
  }
}
