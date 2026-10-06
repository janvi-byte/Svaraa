import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getSpeakingProfile as getProfile,
  updatePreferences,
} from '../controllers/profileController.js';
import { getLessons, completeLesson } from '../controllers/lessonController.js';

const router = Router();
router.use(protect);
router.get('/', getProfile);
router.put('/preferences', updatePreferences);
router.get('/lessons', getLessons);
router.post('/lessons/:lessonId/complete', completeLesson);
export default router;
