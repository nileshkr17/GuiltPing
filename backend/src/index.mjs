import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { log, error as logError } from './utils/logger.mjs';
import { startCron } from './cron.mjs';

import authRouter from './routes/auth.mjs';
import checkinRouter from './routes/checkins.mjs';
import notificationsRouter from './routes/notifications.mjs';
import groupsRouter from './routes/groups.mjs';
import profileRouter from './routes/profile.mjs';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:8080',
  'https://guiltping.netlify.app',
  'https://guilt-ping.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all origins if CORS_ORIGIN is '*'
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log blocked origin for debugging
    log(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use((req, _res, next) => {
  log('Request start', { method: req.method, url: req.url });
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/checkins', checkinRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/profile', profileRouter);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  startCron();
  app.listen(PORT, () => {
    log(`GuiltPing backend listening on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  logError('Failed to start server', e);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logError('UnhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
  logError('UncaughtException', err);
});
