import rateLimit from "express-rate-limit";

// counts only FAILED attempts, so normal logins are never blocked
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many failed attempts. Please try again in 15 minutes.",
  },
});
