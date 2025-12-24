"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Image from "next/image"

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

const GitHubUserLink = ({ username }: { username: string }) => {
  if (!username) return null

  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group"
    >
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 group-hover:border-zinc-500 transition-colors">
        <Image
          src={`https://avatars.githubusercontent.com/${username}?size=40`}
          alt={`${username}`}
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
      <span className="group-hover:text-white font-medium text-sm">{username}</span>
    </a>
  )
}

export default function MetricsSection() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["metrics", currentPage],
    queryFn: () => fetchMetrics(currentPage),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return (
    <div className="mt-16 w-full h-[400px] flex justify-center items-center bg-zinc-950/50 rounded-lg border border-zinc-900">
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
        <span className="text-zinc-500 text-sm">Loading metrics...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="mt-16 p-6 bg-red-950/10 border border-red-900/20 rounded-lg text-red-500 text-center text-sm">
      Unable to load metrics. Please try again later.
    </div>
  )

  const chartData = data?.activeUsers.map((user) => ({
    username: user.username,
    usage_count: user.usage_count,
    profileUrl: `https://github.com/${user.username}`
  })) || []

  return (
    <div className="mt-20 space-y-10 font-sans">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Project Analytics</h2>
        <p className="text-zinc-500 text-sm max-w-lg">
          Real-time insights into active contributors and usage statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="flex flex-col rounded-xl border border-zinc-900 bg-zinc-950/50 overflow-hidden">
          <div className="p-5 border-b border-zinc-900 bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Top Contributors</h3>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide">User</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data?.activeUsers.map((user, index) => (
                  <tr key={index} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-3">
                      <GitHubUserLink username={user.username} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="px-2 py-1 rounded bg-zinc-900 text-zinc-300 font-mono text-xs border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                        {user.usage_count.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-950">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={!data?.pagination.hasPrev}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
            >
              Previous
            </button>

            <span className="text-xs text-zinc-600 font-mono">
              {data?.pagination.currentPage} / {data?.pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!data?.pagination.hasNext}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-zinc-900 bg-zinc-950/50 p-6 min-h-[400px]">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Activity Trends</h3>
            <p className="text-xs text-zinc-500 mt-1">Usage frequency by top users</p>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="username"
                  tick={{ fill: '#52525b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#52525b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fafafa',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                  }}
                  itemStyle={{ color: '#fafafa' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px', display: 'block' }}
                />
                <Line
                  type="linear"
                  dataKey="usage_count"
                  stroke="#fff"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: '#09090b', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#09090b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
