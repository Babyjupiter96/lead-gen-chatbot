"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lead } from "@/lib/supabase";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 8
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 5
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-600 border-red-200";
  const label =
    score >= 8 ? "High Priority" : score >= 5 ? "Medium Priority" : "Low Priority";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${color}`}>
      {score}/10 — {label}
    </span>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualifying, setQualifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lead not found");
      setLead(data.lead);
    } catch {
      setError("Failed to load lead.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  async function handleGenerateOutreach() {
    setQualifying(true);
    setError(null);
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLead(data.lead);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate outreach");
    } finally {
      setQualifying(false);
    }
  }

  function copyToClipboard() {
    if (lead?.outreach_message) {
      navigator.clipboard.writeText(lead.outreach_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{lead.business_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Business Info
          </h2>
          <dl className="space-y-2.5">
            <div>
              <dt className="text-xs text-gray-400">Industry</dt>
              <dd className="text-gray-800 font-medium capitalize">{lead.industry || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">City</dt>
              <dd className="text-gray-800 font-medium">{lead.city || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Address</dt>
              <dd className="text-gray-800">{lead.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Phone</dt>
              <dd className="text-gray-800">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Website</dt>
              <dd>
                {lead.website_url ? (
                  <a
                    href={lead.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {lead.website_url}
                  </a>
                ) : (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                    No Website
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Performance
          </h2>
          <dl className="space-y-2.5">
            <div>
              <dt className="text-xs text-gray-400">Rating</dt>
              <dd className="text-gray-800 font-medium">
                {lead.rating ? (
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-xl font-bold">{lead.rating}</span>
                    <span className="text-gray-400 text-sm">/ 5</span>
                  </span>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Review Count</dt>
              <dd className="text-gray-800 font-medium">
                {lead.review_count?.toLocaleString() ?? "—"} reviews
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Qualification Score</dt>
              <dd className="mt-1">
                <ScoreBadge score={lead.qualification_score} />
                {lead.qualification_score === null && (
                  <span className="text-gray-400 text-sm">Not scored yet</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Added</dt>
              <dd className="text-gray-800">
                {new Date(lead.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-3 mb-6">
        {lead.google_maps_url && (
          <a
            href={lead.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            View on Google Maps
          </a>
        )}
        {lead.website_url && (
          <a
            href={lead.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Website
          </a>
        )}
      </div>

      {/* Outreach Message */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            AI Outreach Message
          </h2>
          {lead.outreach_message && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        {lead.outreach_message ? (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-gray-700 leading-relaxed">{lead.outreach_message}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500 text-sm">No outreach message yet.</p>
            <p className="text-gray-400 text-xs mt-1">Click below to generate one with GPT-4o.</p>
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateOutreach}
          disabled={qualifying}
          className="mt-4 w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {qualifying ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating with GPT-4o…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {lead.outreach_message ? "Regenerate Outreach Message" : "Generate Outreach Message"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
