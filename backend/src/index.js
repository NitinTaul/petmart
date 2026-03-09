require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const logger = require('./config/logger');
const v1Routes = require('./routes/v1');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
 origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5000, message: 'Too many requests' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many auth attempts' });
app.use('/api/', limiter);
app.use('/api/v1/auth/', authLimiter);

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Logger (Morgan → Winston) ───────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ───────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 PetMart API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
