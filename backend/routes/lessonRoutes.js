import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLessons, completeLesson } from '../controllers/lessonController.js';

const router = Router();
router.use(protect);
router.get('/', getLessons);
router.post('/:lessonId/complete', completeLesson);
export default router;
