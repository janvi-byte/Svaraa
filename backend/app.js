import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import assessmentRoutes from './routes/assessmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import retryRoutes from './routes/retryRoutes.js';
import speakingRoutes from './routes/speakingRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'speakora-backend' }));
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/retry', retryRoutes);
app.use('/api/conversation', conversationRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
