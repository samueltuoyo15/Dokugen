import axios from "axios"

export const fetchGitHubReadme = async (url: string): Promise<string> => {
  try {
    const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')

    const response = await axios.get<string>(rawUrl, { responseType: "text" })
    return response.data
  } catch (error) {
    console.error("❌ Failed to fetch GitHub README:", error)
    throw new Error("Invalid GitHub URL or README not found")
  }
}
