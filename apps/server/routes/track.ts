import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { trackUser } from "../lib/supabaseTracker";
import logger from "../utils/logger";

const router = Router();

router.post(
  "/track",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { userInfo, usageType } = req.body;
      if (!userInfo || !userInfo.username || !userInfo.email) {
        return res.status(400).json({ error: "Missing userInfo" });
      }
      const id = userInfo.id || uuidv4();
      await trackUser({ ...userInfo, id }, usageType);
      logger.info(`Tracked action for user ${userInfo.username} (type: ${usageType || "license"})`);
      return res.status(200).json({ ok: true });
    } catch (error) {
      logger.error(error, "Error in /api/track");
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
