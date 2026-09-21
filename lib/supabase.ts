import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (for API routes)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type Lead = {
  id: string;
  business_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  industry: string | null;
  rating: number | null;
  review_count: number | null;
  website_url: string | null;
  has_website: boolean;
  google_maps_url: string | null;
  outreach_message: string | null;
  qualification_score: number | null;
  created_at: string;
};
