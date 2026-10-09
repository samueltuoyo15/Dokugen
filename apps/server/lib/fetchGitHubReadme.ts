import axios from "axios";

export const fetchGitHubReadme = async (url: string): Promise<string> => {
  try {
    if (!url.startsWith("https://github.com/") && !url.startsWith("https://raw.githubusercontent.com/")) {
      throw new Error("Only github.com and raw.githubusercontent.com URLs are allowed");
    }

    const rawUrl = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");

    const response = await axios.get<string>(rawUrl, {
      responseType: "text",
      timeout: 10_000,
      maxContentLength: 1024 * 1024,
      maxBodyLength: 1024 * 1024,
      maxRedirects: 3,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch GitHub README:", error);
    throw new Error("Invalid GitHub URL or README not found");
  }
};
