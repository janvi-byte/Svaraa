import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  randomTopic,
  nextChallengeTopic,
  speakingProfile,
  speakingHistory,
  startSpeakingSession,
  submitSpeakingSession,
  analyzeSpeaking,
  getRetryAttempts,
  compareRetryAttempts,
} from '../controllers/speakingController.js';
import {
  transcribeAudio,
  transcribeUpload,
} from '../controllers/transcribeController.js';
import { checkPronunciation } from '../controllers/pronunciationController.js';

const router = Router();

router.use(protect);

router.get('/topics/random', randomTopic);
router.get('/topics/next', nextChallengeTopic);
router.post('/start', startSpeakingSession);
router.post('/transcribe', transcribeUpload, transcribeAudio);
router.post('/analyze', analyzeSpeaking);
router.post('/analyze/pronunciation', checkPronunciation);
router.post('/:sessionId/submit', submitSpeakingSession);
router.get('/history', speakingHistory);
router.get('/profile', speakingProfile);
router.get('/attempts/:retryGroup', getRetryAttempts);
router.get('/attempts/:retryGroup/compare', compareRetryAttempts);

export default router;