import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "Ok",
    uptime: process.uptime(),
  });
});

export default router;
