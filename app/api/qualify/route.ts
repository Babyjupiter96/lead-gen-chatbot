import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateOutreachMessage } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const db = createServerClient();

    const { data: lead, error: fetchError } = await db
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { message, score } = await generateOutreachMessage({
      business_name: lead.business_name,
      industry: lead.industry,
      city: lead.city,
      rating: lead.rating,
      review_count: lead.review_count,
      has_website: lead.has_website,
    });

    const { data: updated, error: updateError } = await db
      .from("leads")
      .update({
        outreach_message: message,
        qualification_score: score,
      })
      .eq("id", leadId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ lead: updated });
  } catch (err: unknown) {
    console.error("Qualify error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
