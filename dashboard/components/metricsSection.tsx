"use client"

import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"


interface UserMetrics {
  id: string;
  username: string;
  email: string;
  usage_count: number;
}

interface ApiResponse {
  activeUsers: UserMetrics[];
}


const fetchMetrics = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("https://dokugen-readme.vercel.app/api/active-users")
    console.log("Response status:", response.status)
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`)
    }
    const data = await response.json()
    return data;
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

export default function MetricsSection() {
  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["metrics"], 
    queryFn: fetchMetrics, 
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <div className="text-gray-300">Loading metrics...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>
  }

  const chartData = data?.activeUsers.map((user) => ({
    username: user.username,
    usage_count: user.usage_count,
  }))

  return (
    <div className="mt-16">
      <h2 className="text-4xl font-bold mb-8">Dokugen Metrics</h2>

      {/* User Metrics Table */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h3 className="text-2xl font-bold mb-4">Active Users</h3>
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
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.usage_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Count Bar Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Usage Count by User</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usage_count" fill="#8884d8" name="Usage Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}