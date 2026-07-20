import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import logger from "./utils/logger";
import { limiter } from "./middleware/rateLimiter";
import healthRouter from "./routes/health";
import readmeRouter from "./routes/readme";
import commitRouter from "./routes/commit";
import trackRouter from "./routes/track";

dotenv.config();

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const credPath = "/tmp/google-service-account.json";
  try {
    fs.writeFileSync(credPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON, "utf-8");
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    logger.info("Google Cloud service account credentials written from env var");
  } catch (err) {
    logger.error({ err }, "Failed to write Google Cloud service account credentials");
  }
}

const app: Application = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["*"],
    // credentials:true is intentionally omitted, because this is a public API with no cookies
  }),
);
app.use(helmet());
// Global 10 MB limit, the /api/generate-readme route sets its own 500 MB override
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(limiter);
app.use("/api", healthRouter);
app.use("/api", readmeRouter);
app.use("/api", commitRouter);
app.use("/api", trackRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Dokugen API is running");
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ message: err.message, name: err.name }, "Unhandled error");
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => {
  logger.info(`Dokugen running on port ${PORT}`);
});
