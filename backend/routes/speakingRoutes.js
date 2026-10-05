import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  randomTopic,
  speakingHistory,
  startSpeakingSession,
  submitSpeakingSession,
  analyzeSpeaking,
} from '../controllers/speakingController.js';
import {
  transcribeAudio,
  transcribeUpload,
} from '../controllers/transcribeController.js';

const router = Router();

router.use(protect);

router.get('/topics/random', randomTopic);
router.post('/start', startSpeakingSession);
router.post('/transcribe', transcribeUpload, transcribeAudio);
router.post('/analyze', analyzeSpeaking);
router.post('/:sessionId/submit', submitSpeakingSession);
router.get('/history', speakingHistory);

export default router;