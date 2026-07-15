import { supabase } from "../supabase";
import logger from "../utils/logger";

interface UserInfo {
  username?: string;
  email?: string;
  id?: string;
  osInfo?: any;
}

export async function trackUser(userInfo: UserInfo | undefined, usageType?: string) {
  if (!userInfo) return;
  const { username, email, osInfo } = userInfo;
  if (!email || !username) return;

  const id = userInfo.id;

  // Map usageType to database column
  let columnToIncrement = "readme_usage";
  if (usageType === "commit") {
    columnToIncrement = "commit_usage";
  } else if (usageType === "license") {
    columnToIncrement = "license_usage";
  } else if (usageType === "revert") {
    columnToIncrement = "revert_usage";
  }

  try {
    const { data: existingUser, error: userError } = await supabase
      .from("active_users")
      .select("id, usage_count, readme_usage, commit_usage, license_usage, revert_usage")
      .eq("email", email)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (existingUser) {
      const currentSpecificCount = (existingUser as any)[columnToIncrement] || 0;
      const updateData: Record<string, any> = {
        usage_count: existingUser.usage_count + 1,
        [columnToIncrement]: currentSpecificCount + 1,
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
          usage_count: 1,
          [columnToIncrement]: 1
        }]);
    }
    logger.info({ username, emailDomain: email?.split("@")[1], usageType }, "Updated active user");
  } catch (error) {
    logger.error(error, "Supabase user tracking failed:");
  }
}
