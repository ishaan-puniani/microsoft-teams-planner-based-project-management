import rateLimit from 'express-rate-limit';
// import MongoStore from 'rate-limit-mongo';
// import { getConfig } from '../config';

export function createRateLimiter({
  max,
  windowMs,
  message,
}: {
  max: number;
  windowMs: number;
  message: string;
}) {
  return rateLimit({
    // store: new MongoStore({
    //   uri: getConfig().DATABASE_CONNECTION,
    // }),
    limit: max,
    windowMs,
    message: {
      error: message,
    },
    skip: (req) => {
      if (req.method === 'OPTIONS') {
        return true;
      }

      if (req.originalUrl.endsWith('/import')) {
        return true;
      }

      return false;
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        error: message,
      });
    },
  });
}
