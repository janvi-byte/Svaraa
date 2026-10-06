import SpeakingProfile from '../models/SpeakingProfile.js';
import VocabularyProfile from '../models/VocabularyProfile.js';
import { getOverusedWords } from '../services/vocabularyService.js';
import { generateNextChallengeMessage } from '../services/adaptiveService.js';

export async function getSpeakingProfile(req, res, next) {
  try {
    const profile = await SpeakingProfile.findOne({ user: req.user._id });
    const vocabProfile = await VocabularyProfile.findOne({ user: req.user._id });
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
        currentDifficulty: 'Easy',
      },
      overusedWords,
      nextChallenge,
      vocabularyProfile: vocabProfile || { totalWordsUsed: 0, words: [], targetWords: [] },
    });
  } catch (error) {
    return next(error);
  }
}
