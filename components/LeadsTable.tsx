"use client";

import { useState } from "react";
import Link from "next/link";
import { Lead } from "@/lib/supabase";

type Props = {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLeadUpdated: (lead: Lead) => void;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">—</span>;
  const color =
    score >= 8
      ? "bg-green-100 text-green-700"
      : score >= 5
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score}/10
    </span>
  );
}

export default function LeadsTable({
  leads,
  total,
  page,
  totalPages,
  onPageChange,
  onLeadUpdated,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleGenerateOutreach(leadId: string) {
    setLoadingId(leadId);
    setErrorId(null);
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onLeadUpdated(data.lead);
    } catch (err: unknown) {
      console.error(err);
      setErrorId(leadId);
    } finally {
      setLoadingId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500 font-medium">No leads found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or run a new search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Business</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Industry</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">City</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Rating</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reviews</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Website</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {lead.business_name}
                  </Link>
                  {lead.phone && (
                    <p className="text-gray-400 text-xs mt-0.5">{lead.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">{lead.industry || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{lead.city || "—"}</td>
                <td className="px-4 py-3">
                  {lead.rating ? (
                    <span className="flex items-center gap-1 text-gray-700">
                      <span className="text-yellow-400">★</span>
                      {lead.rating}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.review_count?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {lead.has_website ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                      No Site
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={lead.qualification_score} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateOutreach(lead.id)}
                      disabled={loadingId === lead.id}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                    >
                      {loadingId === lead.id ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Generating…
                        </span>
                      ) : lead.outreach_message ? (
                        "Regenerate"
                      ) : (
                        "Generate Outreach"
                      )}
                    </button>
                    {errorId === lead.id && (
                      <span className="text-red-500 text-xs">Failed</span>
                    )}
                    <Link
                      href={`/leads/${lead.id}`}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {leads.length} of {total?.toLocaleString()} leads
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
