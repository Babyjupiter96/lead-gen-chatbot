"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatsCards from "@/components/StatsCards";
import LeadsFilters from "@/components/LeadsFilters";
import LeadsTable from "@/components/LeadsTable";
import { Lead } from "@/lib/supabase";

type LeadsResponse = {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
};

type StatsData = {
  total: number;
  noWebsite: number;
  avgRating: number;
  thisWeek: number;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leadsData, setLeadsData] = useState<LeadsResponse>({
    leads: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    noWebsite: 0,
    avgRating: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch leads");
      setLeadsData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, noWebRes] = await Promise.all([
        fetch("/api/leads?page=1"),
        fetch("/api/leads?has_website=false&page=1"),
      ]);
      const [allData, noWebData] = await Promise.all([
        allRes.json(),
        noWebRes.json(),
      ]);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const leads: Lead[] = allData.leads || [];
      const ratings = leads
        .filter((l) => l.rating !== null)
        .map((l) => l.rating as number);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      const thisWeekCount = leads.filter(
        (l) => new Date(l.created_at) >= oneWeekAgo
      ).length;

      setStats({
        total: allData.total || 0,
        noWebsite: noWebData.total || 0,
        avgRating,
        thisWeek: thisWeekCount,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/?${params.toString()}`);
  }

  function handleLeadUpdated(updatedLead: Lead) {
    setLeadsData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)),
    }));
  }

  function buildExportUrl() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    return `/api/export?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and qualify your local business leads
          </p>
        </div>
        <a
          href={buildExportUrl()}
          download
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </a>
      </div>

      <StatsCards stats={stats} />

      <LeadsFilters />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <LeadsTable
          leads={leadsData.leads}
          total={leadsData.total}
          page={leadsData.page}
          totalPages={leadsData.totalPages}
          onPageChange={handlePageChange}
          onLeadUpdated={handleLeadUpdated}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
