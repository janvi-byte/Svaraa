import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSpeakingProfile } from '../controllers/profileController.js';

const router = Router();
router.use(protect);
router.get('/', getSpeakingProfile);
export default router;
