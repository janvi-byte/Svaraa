import { Router } from 'express';
import {
  addMessage,
  completeRoleplay,
  conversationHistory,
  getTutors,
  startConversation,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/tutors', getTutors);
router.post('/start', startConversation);
router.post('/:conversationId/message', addMessage);
router.post('/:conversationId/complete', completeRoleplay);
router.get('/history', conversationHistory);
export default router;
