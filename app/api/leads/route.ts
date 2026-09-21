import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry");
    const city = searchParams.get("city");
    const minRating = searchParams.get("min_rating");
    const minReviews = searchParams.get("min_reviews");
    const hasWebsite = searchParams.get("has_website");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 25;

    const db = createServerClient();
    let query = db.from("leads").select("*", { count: "exact" });

    if (industry) query = query.eq("industry", industry);
    if (city) query = query.ilike("city", `%${city}%`);
    if (minRating) query = query.gte("rating", parseFloat(minRating));
    if (minReviews) query = query.gte("review_count", parseInt(minReviews));
    if (hasWebsite === "false") query = query.eq("has_website", false);
    if (hasWebsite === "true") query = query.eq("has_website", true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: data,
      total: count,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    });
  } catch (err: unknown) {
    console.error("Leads fetch error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
