import type { Request } from "express";
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === "/health" || req.path === "/api/health";
  },
});
