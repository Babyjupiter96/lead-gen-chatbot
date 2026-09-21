import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { searchPlaces } from "@/lib/googlemaps";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, industry } = body;

    if (!city || !industry) {
      return NextResponse.json(
        { error: "city and industry are required" },
        { status: 400 }
      );
    }

    const places = await searchPlaces(city.trim(), industry.trim());

    if (places.length === 0) {
      return NextResponse.json({ count: 0, leads: [] });
    }

    const db = createServerClient();

    // Upsert leads — avoid duplication by checking business_name + city
    const { data, error } = await db
      .from("leads")
      .upsert(places, {
        onConflict: "business_name,city",
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save leads to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: places.length, leads: data });
  } catch (err: unknown) {
    console.error("Search error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
