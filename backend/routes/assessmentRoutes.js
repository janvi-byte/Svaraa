import { Router } from 'express';
import { startAssessment, submitAssessment } from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/start', startAssessment);
router.post('/submit', submitAssessment);
export default router;
