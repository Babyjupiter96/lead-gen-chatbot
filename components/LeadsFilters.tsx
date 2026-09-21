"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function LeadsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</label>
        <input
          type="text"
          placeholder="e.g. restaurant"
          defaultValue={searchParams.get("industry") || ""}
          onChange={(e) => updateFilter("industry", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
        <input
          type="text"
          placeholder="e.g. Phoenix"
          defaultValue={searchParams.get("city") || ""}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Rating</label>
        <select
          defaultValue={searchParams.get("min_rating") || ""}
          onChange={(e) => updateFilter("min_rating", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="3.5">3.5+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Reviews</label>
        <select
          defaultValue={searchParams.get("min_reviews") || ""}
          onChange={(e) => updateFilter("min_reviews", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any</option>
          <option value="5">5+</option>
          <option value="10">10+</option>
          <option value="25">25+</option>
          <option value="50">50+</option>
          <option value="100">100+</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website</label>
        <select
          defaultValue={searchParams.get("has_website") || ""}
          onChange={(e) => updateFilter("has_website", e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="false">No Website</option>
          <option value="true">Has Website</option>
        </select>
      </div>

      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
