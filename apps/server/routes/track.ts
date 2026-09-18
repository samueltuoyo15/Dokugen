import { type Request, type Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { trackUser } from "../lib/supabaseTracker";
import { supabase } from "../supabase";
import logger from "../utils/logger";

const router = Router();

router.post("/track", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userInfo, usageType } = req.body;
    if (!userInfo || !userInfo.username || !userInfo.email) {
      res.status(400).json({ error: "Missing userInfo" });
      return;
    }
    const ALLOWED_PUBLIC_TYPES = ["license", "revert"];
    if (!ALLOWED_PUBLIC_TYPES.includes(usageType)) {
      res.status(403).json({ error: "Invalid or forbidden usage type for this endpoint" });
      return;
    }

    // Check if user already exists (must have used a core feature first)
    const { data: existingUser } = await supabase
      .from("active_users")
      .select("id")
      .or(`email.eq.${userInfo.email},username.eq.${userInfo.username}`)
      .limit(1)
      .maybeSingle();

    if (!existingUser) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const id = userInfo.id || uuidv4();
    await trackUser({ ...userInfo, id }, usageType);
    logger.info(`Tracked action for user ${userInfo.username} (type: ${usageType || "license"})`);
    res.status(200).json({ ok: true });
  } catch (error) {
    logger.error(error, "Error in /api/track");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
