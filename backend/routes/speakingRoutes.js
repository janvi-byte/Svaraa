import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  randomTopic,
  nextChallengeTopic,
  speakingProfile,
  speakingHistory,
  speakingAnalytics,
  startSpeakingSession,
  submitSpeakingSession,
  analyzeSpeaking,
  getRetryAttempts,
  compareRetryAttempts,
  presentationTopics,
  startPresentation,
  completePresentation,
} from '../controllers/speakingController.js';
import {
  transcribeAudio,
  transcribeUpload,
} from '../controllers/transcribeController.js';
import {
  alignReferenceAudio,
  checkPronunciation,
  getPronunciationReferences,
  referenceAlignmentUpload,
} from '../controllers/pronunciationController.js';

const router = Router();

router.use(protect);

router.get('/topics/random', randomTopic);
router.get('/topics/next', nextChallengeTopic);
router.get('/presentation-topics', presentationTopics);
router.post('/presentation/start', startPresentation);
router.post('/presentation/:sessionId/complete', completePresentation);
router.post('/start', startSpeakingSession);
router.post('/transcribe', transcribeUpload, transcribeAudio);
router.post('/analyze', analyzeSpeaking);
router.post('/analyze/pronunciation', checkPronunciation);
router.get('/pronunciation-references', getPronunciationReferences);
router.post(
  '/pronunciation-reference/align',
  referenceAlignmentUpload,
  alignReferenceAudio
);
router.post('/:sessionId/submit', submitSpeakingSession);
router.get('/history', speakingHistory);
router.get('/analytics', speakingAnalytics);
router.get('/profile', speakingProfile);
router.get('/attempts/:retryGroup', getRetryAttempts);
router.get('/attempts/:retryGroup/compare', compareRetryAttempts);

export default router;