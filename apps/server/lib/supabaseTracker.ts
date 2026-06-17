import { supabase } from "../supabase";
import logger from "../utils/logger";

interface UserInfo {
  username?: string;
  email?: string;
  id?: string;
  osInfo?: any;
}

export async function trackUser(userInfo: UserInfo | undefined) {
  if (!userInfo) return;
  const { username, email, osInfo } = userInfo;
  if (!email || !username) return;

  const id = userInfo.id;

  try {
    const { data: existingUser, error: userError } = await supabase
      .from("active_users")
      .select("id, usage_count")
      .eq("email", email)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (existingUser) {
      const updateData: { usage_count: number; osInfo?: string } = {
        usage_count: existingUser.usage_count + 1,
      };
      if (osInfo) {
        updateData.osInfo = typeof osInfo === "object" ? JSON.stringify(osInfo) : osInfo;
      }
      await supabase
        .from("active_users")
        .update(updateData)
        .eq("id", existingUser.id);
    } else {
      await supabase
        .from("active_users")
        .insert([{ 
          username, 
          email, 
          id, 
          osInfo: typeof osInfo === "object" ? JSON.stringify(osInfo) : osInfo, 
          usage_count: 1 
        }]);
    }
    logger.info(`Updated Active user ${username}, ${email}`);
  } catch (error) {
    logger.error(error, "Supabase user tracking failed:");
  }
}
