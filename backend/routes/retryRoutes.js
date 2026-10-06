import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getRetryComparison,
  getRetryHistory,
  startRetry,
} from '../controllers/retryController.js';

const router = Router();
router.use(protect);
router.post('/start', startRetry);
router.get('/history', getRetryHistory);
router.get('/:retryGroupId/comparison', getRetryComparison);
export default router;
