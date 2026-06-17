import rateLimit from "express-rate-limit";
import { Request } from "express";

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return (
      req.path === "/health" ||
      req.path === "/api/health" ||
      !!req.body?.geminiApiKey ||
      !!req.body?.groqApiKey
    );
  },
});
