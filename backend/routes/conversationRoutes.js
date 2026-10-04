import { Router } from 'express';
import { addMessage, conversationHistory, startConversation } from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/start', startConversation);
router.post('/:conversationId/message', addMessage);
router.get('/history', conversationHistory);
export default router;
