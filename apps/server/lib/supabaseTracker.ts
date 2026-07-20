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
  if (!email && !username) return;

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

  let formattedOsInfo: string | null = null;
  if (osInfo) {
    if (typeof osInfo === "object") {
      formattedOsInfo = JSON.stringify(osInfo);
    } else if (typeof osInfo === "string") {
      try {
        const parsed = JSON.parse(osInfo);
        formattedOsInfo = typeof parsed === "object" ? JSON.stringify(parsed) : osInfo;
      } catch {
        formattedOsInfo = osInfo;
      }
    }
  }

  try {
    let existingUser: any = null;

    if (email) {
      const { data, error } = await supabase
        .from("active_users")
        .select("id, username, email, usage_count, readme_usage, commit_usage, license_usage, revert_usage")
        .eq("email", email)
        .maybeSingle();

      if (!error && data) {
        existingUser = data;
      }
    }

    if (!existingUser && username) {
      const { data, error } = await supabase
        .from("active_users")
        .select("id, username, email, usage_count, readme_usage, commit_usage, license_usage, revert_usage")
        .eq("username", username)
        .maybeSingle();

      if (!error && data) {
        existingUser = data;
      }
    }

    if (existingUser) {
      const currentSpecificCount = (existingUser as any)[columnToIncrement] || 0;
      const updateData: Record<string, any> = {
        usage_count: (existingUser.usage_count || 0) + 1,
        [columnToIncrement]: currentSpecificCount + 1,
      };

      // Keep username & email up to date if new info is available
      if (username && existingUser.username !== username && username !== "Unknown") {
        updateData.username = username;
      }
      if (email && existingUser.email !== email && email !== "") {
        updateData.email = email;
      }

      if (formattedOsInfo) {
        updateData.osInfo = formattedOsInfo;
      }

      await supabase
        .from("active_users")
        .update(updateData)
        .eq("id", existingUser.id);
    } else {
      await supabase
        .from("active_users")
        .insert([{ 
          username: username || "Unknown", 
          email: email || "", 
          id, 
          osInfo: formattedOsInfo, 
          usage_count: 1,
          [columnToIncrement]: 1
        }]);
    }
    logger.info({ username, emailDomain: email ? email.split("@")[1] : undefined, usageType }, "Updated active user");
  } catch (error) {
    logger.error(error, "Supabase user tracking failed:");
  }
}
