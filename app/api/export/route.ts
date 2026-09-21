import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function escapeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry");
    const city = searchParams.get("city");
    const minRating = searchParams.get("min_rating");
    const minReviews = searchParams.get("min_reviews");
    const hasWebsite = searchParams.get("has_website");

    const db = createServerClient();
    let query = db.from("leads").select("*");

    if (industry) query = query.eq("industry", industry);
    if (city) query = query.ilike("city", `%${city}%`);
    if (minRating) query = query.gte("rating", parseFloat(minRating));
    if (minReviews) query = query.gte("review_count", parseInt(minReviews));
    if (hasWebsite === "false") query = query.eq("has_website", false);
    if (hasWebsite === "true") query = query.eq("has_website", true);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    const headers = [
      "Business Name",
      "Phone",
      "Address",
      "City",
      "Industry",
      "Rating",
      "Review Count",
      "Has Website",
      "Website URL",
      "Google Maps URL",
      "Qualification Score",
      "Outreach Message",
      "Created At",
    ];

    const rows = (data || []).map((lead) => [
      escapeCsvField(lead.business_name),
      escapeCsvField(lead.phone),
      escapeCsvField(lead.address),
      escapeCsvField(lead.city),
      escapeCsvField(lead.industry),
      escapeCsvField(lead.rating),
      escapeCsvField(lead.review_count),
      escapeCsvField(lead.has_website ? "Yes" : "No"),
      escapeCsvField(lead.website_url),
      escapeCsvField(lead.google_maps_url),
      escapeCsvField(lead.qualification_score),
      escapeCsvField(lead.outreach_message),
      escapeCsvField(lead.created_at),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
