"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import Image from "next/image"
import { ArrowDown, ArrowUpDown, FileText, GitCommit, Award, RotateCcw } from "lucide-react"

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

const fetchMetrics = async (page: number, sortBy: string = "usage_count"): Promise<ApiResponse> => {
  try {
    const response = await fetch(`https://dokugen-readme.vercel.app/api/active-users?page=${page}&limit=10&sortBy=${sortBy}`)
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
  const [sortBy, setSortBy] = useState<string>("usage_count")
  const [activeChartMetric, setActiveChartMetric] = useState<string>("all")
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({
    Total: false,
    READMEs: false,
    Commits: false,
    Licenses: false,
    Reverts: false,
  })

  const toggleLine = (dataKey: string) => {
    setHiddenLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }))
  }

  const handleSortChange = (column: string) => {
    setSortBy(column)
    setCurrentPage(1)
  }

  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: ["metrics", currentPage, sortBy],
    queryFn: () => fetchMetrics(currentPage, sortBy),
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
                  <th
                    onClick={() => handleSortChange("usage_count")}
                    className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right cursor-pointer hover:text-zinc-800 select-none transition-colors group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 w-full">
                      Total
                      {sortBy === "usage_count" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      )}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortChange("readme_usage")}
                    className="hidden sm:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right cursor-pointer hover:text-zinc-800 select-none transition-colors group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 w-full">
                      READMEs
                      {sortBy === "readme_usage" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      )}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortChange("commit_usage")}
                    className="hidden sm:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right cursor-pointer hover:text-zinc-800 select-none transition-colors group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 w-full">
                      Commits
                      {sortBy === "commit_usage" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      )}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortChange("license_usage")}
                    className="hidden md:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right cursor-pointer hover:text-zinc-800 select-none transition-colors group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 w-full">
                      Licenses
                      {sortBy === "license_usage" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      )}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortChange("revert_usage")}
                    className="hidden md:table-cell px-4 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wide text-right cursor-pointer hover:text-zinc-800 select-none transition-colors group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 w-full">
                      Reverts
                      {sortBy === "revert_usage" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      )}
                    </span>
                  </th>
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
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Activity Trends</h3>
              <p className="text-xs text-zinc-500 mt-1">Usage frequency by feature type per top user. Click tabs to isolate metrics.</p>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/40">
              <button
                onClick={() => setActiveChartMetric("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                  activeChartMetric === "all"
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/20"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-zinc-600" />
                All Features
              </button>
              <button
                onClick={() => setActiveChartMetric("READMEs")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                  activeChartMetric === "READMEs"
                    ? "bg-white text-emerald-600 shadow-sm border border-emerald-200/20"
                    : "text-zinc-500 hover:text-emerald-600"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                READMEs
              </button>
              <button
                onClick={() => setActiveChartMetric("Commits")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                  activeChartMetric === "Commits"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-200/20"
                    : "text-zinc-500 hover:text-blue-600"
                }`}
              >
                <GitCommit className="w-3.5 h-3.5 text-blue-500" />
                Commits
              </button>
              <button
                onClick={() => setActiveChartMetric("Licenses")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                  activeChartMetric === "Licenses"
                    ? "bg-white text-rose-600 shadow-sm border border-rose-200/20"
                    : "text-zinc-500 hover:text-rose-600"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-rose-500" />
                Licenses
              </button>
              <button
                onClick={() => setActiveChartMetric("Reverts")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                  activeChartMetric === "Reverts"
                    ? "bg-white text-amber-600 shadow-sm border border-amber-200/20"
                    : "text-zinc-500 hover:text-amber-600"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                Reverts
              </button>
            </div>
          </div>

          <div className="w-full" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  cursor={{ fill: '#f4f4f5', opacity: 0.4 }}
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
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
                  onClick={(e) => {
                    if (e && e.dataKey) {
                      toggleLine(e.dataKey as string)
                    }
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value, entry: any) => {
                    const isHidden = hiddenLines[entry.dataKey as string]
                    return (
                      <span
                        style={{
                          color: isHidden ? '#cbd5e1' : entry.color,
                          textDecoration: isHidden ? 'line-through' : 'none',
                          cursor: 'pointer',
                          userSelect: 'none',
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </span>
                    )
                  }}
                />
                {(activeChartMetric === "all" || activeChartMetric === "READMEs") && (
                  <Bar
                    hide={hiddenLines.READMEs}
                    dataKey="READMEs"
                    stackId={activeChartMetric === "all" ? "a" : undefined}
                    fill="#10b981"
                    name="READMEs"
                    radius={activeChartMetric === "all" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  />
                )}
                {(activeChartMetric === "all" || activeChartMetric === "Commits") && (
                  <Bar
                    hide={hiddenLines.Commits}
                    dataKey="Commits"
                    stackId={activeChartMetric === "all" ? "a" : undefined}
                    fill="#3b82f6"
                    name="Commits"
                    radius={activeChartMetric === "all" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  />
                )}
                {(activeChartMetric === "all" || activeChartMetric === "Licenses") && (
                  <Bar
                    hide={hiddenLines.Licenses}
                    dataKey="Licenses"
                    stackId={activeChartMetric === "all" ? "a" : undefined}
                    fill="#f43f5e"
                    name="Licenses"
                    radius={activeChartMetric === "all" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  />
                )}
                {(activeChartMetric === "all" || activeChartMetric === "Reverts") && (
                  <Bar
                    hide={hiddenLines.Reverts}
                    dataKey="Reverts"
                    stackId={activeChartMetric === "all" ? "a" : undefined}
                    fill="#f59e0b"
                    name="Reverts"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {activeChartMetric === "all" && (
                  <Line
                    hide={hiddenLines.Total}
                    type="monotone"
                    dataKey="Total"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    name="Total Usage"
                    dot={{ r: 4, fill: '#ffffff', stroke: '#7c3aed', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
