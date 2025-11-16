import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const logger = new Logger('RateLimiterMiddleware');

// per-IP limits
const contactLimiter = new RateLimiterMemory({
  points: 5, // 5 submissions
  duration: 60 * 60, // per hour
});
const loginLimiter = new RateLimiterMemory({
  points: 10, // 10 login attempts per hour
  duration: 60 * 60,
});
const adminLimiter = new RateLimiterMemory({
  points: 200, // admin actions per minute (generous)
  duration: 60,
});

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = (req.ip ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '') as string;
    try {
      // public contact form POST
      if (req.path === '/contact-submissions' && req.method === 'POST') {
        await contactLimiter.consume(ip);
        return next();
      }

      // auth login attempts (typical NextAuth signIn route)
      if (req.path.startsWith('/api/auth') && req.method === 'POST') {
        await loginLimiter.consume(ip);
        return next();
      }

      // admin endpoints - soft guard by IP (if needed)
      if (
        req.path.startsWith('/admin') ||
        (req.path.startsWith('/contact-submissions') && req.method !== 'GET')
      ) {
        try {
          await adminLimiter.consume(ip);
        } catch {
          // if admin limiter exhausted, allow a minimal path through (so as not to lock out)
        }
        return next();
      }

      return next();
    } catch (rej) {
      logger.warn(`Rate limit exceeded: ${req.path} from ${ip}`);
      res.status(429).json({ message: 'Too many requests' });
    }
  }
}
