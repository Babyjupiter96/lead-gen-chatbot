# LeadGen AI

An AI-powered lead generation tool that finds local businesses via Google Maps, scores them as web design prospects, and generates personalized outreach messages using GPT-4o.

## Features

- **Google Maps scraper** — Search any city + industry (restaurant, plumber, salon, etc.) and pull business name, phone, address, rating, review count, website status
- **Lead dashboard** — Filter by industry, city, min rating, min reviews, website status; paginated table (25/page)
- **AI outreach** — GPT-4o generates a 3-4 sentence personalized cold outreach message per lead
- **Lead scoring** — Each lead is scored 1–10 on likelihood to need web services
- **CSV export** — Export any filtered view to CSV
- **Individual lead pages** — Full detail view with copy-to-clipboard outreach message

## Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- OpenAI GPT-4o
- Google Maps Places API
- Tailwind CSS

## Setup

### 1. Clone and install

```bash
cd lead-gen-chatbot
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API → service_role secret |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `GOOGLE_MAPS_API_KEY` | console.cloud.google.com → APIs & Services → Credentials |

### 3. Google Maps API setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Places API** (legacy) — the Text Search and Place Details endpoints
4. Create an API key under Credentials
5. Restrict the key to **Places API** for security

### 4. Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the contents of `supabase/schema.sql`

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Finding leads

1. Click **New Search** in the sidebar
2. Enter a city (e.g. "Phoenix, AZ") and select an industry
3. Hit Search — up to 20 businesses are fetched and saved
4. Duplicate businesses (same name + city) are automatically skipped

### Generating outreach

- From the dashboard table, click **Generate Outreach** on any row
- Or open a lead's detail page and click the button there
- GPT-4o writes a personalized 3-4 sentence message referencing the business name, industry, and online presence gaps
- The message and qualification score (1–10) are saved to the database

### Exporting

- Click **Export CSV** on the dashboard
- Exports the current filtered view (all pages, not just the visible page)

## Project Structure

```
app/
  page.tsx                 # Dashboard
  search/page.tsx          # New search form
  leads/[id]/page.tsx      # Lead detail + outreach
  api/
    search/route.ts        # POST — Google Maps scrape + save
    qualify/route.ts       # POST — GPT-4o outreach + score
    leads/route.ts         # GET — filtered leads list
    leads/[id]/route.ts    # GET — single lead
    export/route.ts        # GET — CSV download
components/
  Sidebar.tsx
  StatsCards.tsx
  LeadsFilters.tsx
  LeadsTable.tsx
lib/
  supabase.ts              # Supabase client + Lead type
  openai.ts                # OpenAI client + generation logic
  googlemaps.ts            # Google Maps Places API wrapper
supabase/
  schema.sql               # Database schema
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Add all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.
