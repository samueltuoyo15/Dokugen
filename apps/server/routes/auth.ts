import { type Request, type Response, Router } from "express";
import { getVerifiedGitHubUser } from "../middleware/githubAuth";
import { supabase } from "../supabase";
import logger from "../utils/logger";

const router = Router();

router.post("/auth/preferences", async (req: Request, res: Response): Promise<void> => {
  const { opted_out } = req.body;
  if (typeof opted_out !== "boolean") {
    res.status(400).json({ error: "opted_out must be a boolean" });
    return;
  }

  const user = getVerifiedGitHubUser(res);
  const { error } = await supabase.from("active_users").update({ opted_out }).eq("username", user.username);

  if (error) {
    logger.error(error, "Failed to update leaderboard preference");
    res.status(500).json({ error: "Failed to update leaderboard preference" });
    return;
  }

  res.status(200).json({ opted_out });
});

export default router;
