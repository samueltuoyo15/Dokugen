"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import Image from "next/image"

interface UserMetrics {
  id: string
  username: string
  email: string
  usage_count: number
  readme_usage?: number
  commit_usage?: number
  license_usage?: number
  revert_usage?: number
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
      className="flex items-center gap-3 text-zinc-500 hover:text-zinc-950 transition-colors group"
    >
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 group-hover:border-zinc-400 transition-colors">
        <Image
          src={`https://avatars.githubusercontent.com/${username}?size=40`}
          alt={`${username}`}
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
      <span className="group-hover:text-zinc-900 font-medium text-sm">{username}</span>
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
    <div className="mt-16 w-full h-[400px] flex justify-center items-center bg-zinc-50 rounded-xl border border-zinc-200/80">
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
        <span className="text-zinc-500 text-sm">Loading metrics...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="mt-16 p-6 bg-red-50 border border-red-200/60 rounded-xl text-red-600 text-center text-sm font-medium">
      Unable to load metrics. Please try again later.
    </div>
  )

  const chartData = data?.activeUsers.map((user) => ({
    username: user.username,
    Total: user.usage_count,
    READMEs: user.readme_usage || 0,
    Commits: user.commit_usage || 0,
    Licenses: user.license_usage || 0,
    Reverts: user.revert_usage || 0,
    profileUrl: `https://github.com/${user.username}`
  })) || []

  return (
    <div className="mt-20 space-y-10 font-sans">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Project Analytics</h2>
        <p className="text-zinc-500 text-sm max-w-lg">
          Real-time insights into active developers using dokugen and usage statistics.
        </p>
      </div>

      <div className="flex flex-col gap-8 w-full">
        <div className="w-full flex flex-col rounded-xl border border-zinc-200/80 bg-white overflow-hidden">
          <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Leaderboard</h3>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide">User</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">Total</th>
                  <th className="hidden sm:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">READMEs</th>
                  <th className="hidden sm:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">Commits</th>
                  <th className="hidden md:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">Licenses</th>
                  <th className="hidden md:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right">Reverts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.activeUsers.map((user, index) => (
                  <tr key={index} className="group hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <GitHubUserLink username={user.username} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white font-mono text-xs font-semibold">
                        {user.usage_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-zinc-600 font-mono text-xs">
                      {(user.readme_usage ?? 0).toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-zinc-600 font-mono text-xs">
                      {(user.commit_usage ?? 0).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-right text-zinc-600 font-mono text-xs">
                      {(user.license_usage ?? 0).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-right text-zinc-600 font-mono text-xs">
                      {(user.revert_usage ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={!data?.pagination.hasPrev}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
            >
              Previous
            </button>

            <span className="text-xs text-zinc-400 font-mono">
              {data?.pagination.currentPage} / {data?.pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!data?.pagination.hasNext}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col rounded-xl border border-zinc-200/80 bg-white p-6">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Activity Trends</h3>
            <p className="text-xs text-zinc-500 mt-1">Usage frequency by feature type per top user</p>
          </div>

          <div className="w-full" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="username"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    color: '#09090b',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#09090b' }}
                  labelStyle={{ color: '#71717a', marginBottom: '4px', display: 'block' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  name="Total Usage"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#7c3aed', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="READMEs"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  name="READMEs"
                  dot={{ r: 3, fill: '#ffffff', stroke: '#10b981', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Commits"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  name="Commits"
                  dot={{ r: 3, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Licenses"
                  stroke="#f43f5e"
                  strokeWidth={1.5}
                  name="Licenses"
                  dot={{ r: 3, fill: '#ffffff', stroke: '#f43f5e', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Reverts"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  name="Reverts"
                  dot={{ r: 3, fill: '#ffffff', stroke: '#f59e0b', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
