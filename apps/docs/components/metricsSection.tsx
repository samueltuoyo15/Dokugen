"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface UserMetrics {
  id: string
  username: string
  email: string
  usage_count: number
}

interface ApiResponse {
  activeUsers: UserMetrics[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const fetchMetrics = async (page: number): Promise<ApiResponse> => {
  try {
    const response = await fetch(`https://dokugen-readme.vercel.app/api/active-users?page=${page}&limit=10`)
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

const GitHubUserLink = ({ username }: { username: string }) => (
  <a 
    href={`https://github.com/${username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
  >
    <img 
      src={`https://github.com/${username}.png?size=40`}
      alt={`${username}'s avatar`}
      className="w-6 h-6 rounded-full"
    />
    <span className="group-hover:underline">{username}</span>
  </a>
)

export default function MetricsSection() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["metrics", currentPage], 
    queryFn: () => fetchMetrics(currentPage), 
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <div className="text-gray-300">Loading metrics...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  const chartData = data?.activeUsers.map((user) => ({
    username: user.username,
    usage_count: user.usage_count,
    profileUrl: `https://github.com/${user.username}`
  }))

  return (
    <div className="mt-16">
      <h2 className="text-4xl font-bold mb-8">Dokugen Metrics</h2>

      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h3 className="text-2xl font-bold mb-4">Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Usage Count</th>
              </tr>
            </thead>
            <tbody>
              {data?.activeUsers.map((user, index) => (
                <tr key={index} className="border-t border-gray-600">
                  <td className="px-4 py-2">
                    <GitHubUserLink username={user.username} />
                  </td>
                  <td className="px-4 py-2">{user.usage_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={!data?.pagination.hasPrev}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-gray-300">
            Page {data?.pagination.currentPage} of {data?.pagination.totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!data?.pagination.hasNext}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Usage Count by User</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="usage_count" fill="#8884d8" name="Usage Count" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}