import { useQuery } from "@tanstack/react-query";

interface SiteStats {
  totalUsers: number;
  totalGenerations: number;
  totalReadmes: number;
  totalCommits: number;
}

const FALLBACK_STATS: SiteStats = { totalUsers: 238, totalGenerations: 2137, totalReadmes: 2084, totalCommits: 49 };

const fetchSiteStats = async (): Promise<SiteStats> => {
  try {
    const res = await fetch("/api/stats");
    if (res.ok) return res.json();
    const fallbackRes = await fetch("https://dokugen.samueltuoyo.com/api/stats");
    return fallbackRes.ok ? fallbackRes.json() : FALLBACK_STATS;
  } catch {
    return FALLBACK_STATS;
  }
};

/** Shared site stats query. The cache key is shared, so every consumer reuses one request. */
export const useSiteStats = () =>
  useQuery<SiteStats>({ queryKey: ["siteStats"], queryFn: fetchSiteStats, staleTime: 1000 * 60 * 5 });
