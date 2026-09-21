"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INDUSTRIES = [
  "restaurant",
  "plumber",
  "electrician",
  "landscaping",
  "hair salon",
  "nail salon",
  "auto repair",
  "dentist",
  "chiropractor",
  "law firm",
  "accountant",
  "real estate agent",
  "cleaning service",
  "painter",
  "roofing",
  "HVAC",
  "gym",
  "yoga studio",
  "florist",
  "photographer",
];

export default function SearchPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalIndustry = industry === "custom" ? customIndustry : industry;

    if (!city.trim() || !finalIndustry.trim()) {
      setError("City and industry are both required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.trim(), industry: finalIndustry.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResult({ count: data.count });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Lead Search</h1>
        <p className="text-gray-500 text-sm mt-1">
          Search Google Maps for local businesses and import them as leads.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Phoenix, AZ"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>

          {industry === "custom" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Custom Industry
              </label>
              <input
                type="text"
                placeholder="e.g. pet groomer"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold">Search complete!</p>
              <p>Found and saved {result.count} businesses.</p>
              <Link href="/" className="underline font-medium mt-1 inline-block">
                View leads on dashboard →
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching Google Maps…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Businesses
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>We search Google Maps Places API for businesses in your city and industry</li>
          <li>Business details (name, phone, address, rating, website) are collected</li>
          <li>Leads are saved to your database — duplicates are automatically skipped</li>
          <li>Use &quot;Generate Outreach&quot; on the dashboard to create AI-powered messages</li>
        </ol>
      </div>
    </div>
  );
}
