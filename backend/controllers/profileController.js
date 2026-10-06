import SpeakingProfile from '../models/SpeakingProfile.js';
import VocabularyProfile from '../models/VocabularyProfile.js';
import User from '../models/User.js';
import { getOverusedWords } from '../services/vocabularyService.js';
import { generateNextChallengeMessage } from '../services/adaptiveService.js';
import { generateNotifications } from './notificationController.js';

export async function getSpeakingProfile(req, res, next) {
  try {
    await generateNotifications(req.user._id);

    const profile = await SpeakingProfile.findOne({ user: req.user._id });
    const vocabProfile = await VocabularyProfile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id).select('preferredLanguage practiceGoal preferredTutor difficulty').lean();

    const overusedWords = getOverusedWords(vocabProfile);
    const nextChallenge = generateNextChallengeMessage(profile);

    return res.json({
      profile: profile || {
        sessionsAnalyzed: 0,
        avgOverall: 0,
        avgGrammar: 0,
        avgFluency: 0,
        avgVocabulary: 0,
        avgPacing: 0,
        strongestSkill: '',
        weakestSkill: '',
        improvingSkill: '',
        decliningSkill: '',
        recentScoreTrend: '',
        currentDifficulty: 'Easy',
      },
      overusedWords,
      nextChallenge,
      vocabularyProfile: vocabProfile || { totalWordsUsed: 0, words: [], targetWords: [] },
      preferences: {
        preferredLanguage: user?.preferredLanguage || 'English',
        practiceGoal: user?.practiceGoal || 'Everyday confidence',
        preferredTutor: user?.preferredTutor || 'Maya',
        difficulty: user?.difficulty || 'Easy',
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { preferredLanguage, practiceGoal, preferredTutor, difficulty } = req.body;

    const update = {};
    if (preferredLanguage) update.preferredLanguage = preferredLanguage;
    if (practiceGoal) update.practiceGoal = practiceGoal;
    if (preferredTutor) update.preferredTutor = preferredTutor;
    if (difficulty) update.difficulty = difficulty;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No preferences provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('preferredLanguage practiceGoal preferredTutor difficulty');

    return res.json({ preferences: user });
  } catch (error) {
    return next(error);
  }
}
