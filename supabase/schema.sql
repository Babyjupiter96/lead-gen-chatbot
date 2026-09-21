-- LeadGen AI — Supabase Schema
-- Run this in the Supabase SQL editor

create table leads (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  phone text,
  address text,
  city text,
  industry text,
  rating numeric,
  review_count integer,
  website_url text,
  has_website boolean default false,
  google_maps_url text,
  outreach_message text,
  qualification_score integer,
  created_at timestamp with time zone default now(),
  -- Prevent duplicate leads for the same business in the same city
  unique(business_name, city)
);

-- Index for common filter queries
create index leads_city_idx on leads(city);
create index leads_industry_idx on leads(industry);
create index leads_has_website_idx on leads(has_website);
create index leads_created_at_idx on leads(created_at desc);
create index leads_rating_idx on leads(rating);

-- Enable Row Level Security
alter table leads enable row level security;

-- Allow all operations with service role key (used in API routes)
-- For production, restrict these policies to authenticated users
create policy "Service role has full access" on leads
  for all
  using (true)
  with check (true);
