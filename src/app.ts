import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import errorMiddleware from './middlewares/error.middleware';
import authRoutes from './routers/auth';
import userRoutes from './routers/users';
import eventRoutes from './routers/events';
import { transactionsRouter as transactionRoutes } from './routers/transactions';
import statsRoutes from './routers/stats';

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/stats', statsRoutes);

app.get('/', (_req, res) =>
  res.json({ ok: true, message: 'Platform Manajemen Acara API (TS)' })
);

// error middleware
app.use(errorMiddleware);

export default app;
