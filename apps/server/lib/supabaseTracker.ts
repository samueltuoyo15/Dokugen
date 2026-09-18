import { supabase } from "../supabase";
import logger from "../utils/logger";

interface UserInfo {
  username?: string;
  email?: string;
  id?: string;
  osInfo?: unknown;
}

export async function trackUser(userInfo: UserInfo | undefined, usageType?: string) {
  if (!userInfo) return;
  const osInfo = userInfo.osInfo;
  const username = userInfo.username?.toLowerCase();
  const email = userInfo.email?.toLowerCase();
  if (!email && !username) return;

  const id = userInfo.id;

  // Map usageType to database column safely without defaulting to readme_usage
  let columnToIncrement: string | null = null;
  if (usageType === "readme") {
    columnToIncrement = "readme_usage";
  } else if (usageType === "update") {
    columnToIncrement = "update_usage";
  } else if (usageType === "commit") {
    columnToIncrement = "commit_usage";
  } else if (usageType === "license") {
    columnToIncrement = "license_usage";
  } else if (usageType === "revert") {
    columnToIncrement = "revert_usage";
  } else if (usageType === "changelog") {
    columnToIncrement = "changelog_usage";
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
    let existingUser: Record<string, unknown> | null = null;

    if (email) {
      const { data, error } = await supabase
        .from("active_users")
        .select(
          "id, username, email, usage_count, readme_usage, update_usage, commit_usage, license_usage, revert_usage, changelog_usage",
        )
        .eq("email", email)
        .maybeSingle();

      if (!error && data) {
        existingUser = data as Record<string, unknown>;
      }
    }

    if (!existingUser && username) {
      const { data, error } = await supabase
        .from("active_users")
        .select(
          "id, username, email, usage_count, readme_usage, update_usage, commit_usage, license_usage, revert_usage, changelog_usage",
        )
        .eq("username", username)
        .maybeSingle();

      if (!error && data) {
        existingUser = data as Record<string, unknown>;
      }
    }

    if (existingUser) {
      const currentUsageCount = Number(existingUser.usage_count || 0);
      const updateData: Record<string, unknown> = {
        usage_count: currentUsageCount + 1,
      };

      if (columnToIncrement) {
        const currentSpecificCount = Number(existingUser[columnToIncrement] || 0);
        updateData[columnToIncrement] = currentSpecificCount + 1;
      }

      // Keep username & email up to date if new info is available
      if (username && existingUser.username !== username && username !== "unknown") {
        updateData.username = username;
      }
      if (email && existingUser.email !== email && email !== "") {
        updateData.email = email;
      }

      if (formattedOsInfo) {
        updateData.osInfo = formattedOsInfo;
      }

      await supabase.from("active_users").update(updateData).eq("id", existingUser.id);
    } else {
      const insertData: Record<string, unknown> = {
        username: username || "unknown",
        email: email || "",
        id,
        osInfo: formattedOsInfo,
        usage_count: 1,
      };

      if (columnToIncrement) {
        insertData[columnToIncrement] = 1;
      }

      await supabase.from("active_users").insert([insertData]);
    }
    logger.info({ username, emailDomain: email ? email.split("@")[1] : undefined, usageType }, "Updated active user");
  } catch (error) {
    logger.error(error, "Supabase user tracking failed:");
  }
}
