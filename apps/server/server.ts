import dns from "node:dns";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";

// Prefer IPv4 for Vertex and Google OAuth calls on VPSes without working IPv6.
dns.setDefaultResultOrder("ipv4first");

import { limiter } from "./middleware/rateLimiter";
import changelogRouter from "./routes/changelog";
import commitRouter from "./routes/commit";
import healthRouter from "./routes/health";
import ogRouter from "./routes/og";
import readmeRouter from "./routes/readme";
import logger from "./utils/logger";

dotenv.config();

const app: Application = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["*"],
  }),
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(limiter);
app.use("/api", healthRouter);
app.use("/api", readmeRouter);
app.use("/api", commitRouter);
app.use("/api", ogRouter);
app.use("/api", changelogRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Dokugen API is running");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ message: err.message, name: err.name }, "Unhandled error");
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || "3000";
const server = app.listen(PORT, () => {
  logger.info(`Dokugen running on port ${PORT}`);
});

const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
