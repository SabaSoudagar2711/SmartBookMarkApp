# Smart Bookmark Manager

A production-grade bookmark manager built with Next.js App Router, Supabase, and Tailwind CSS.

## Features

- Google OAuth sign-in (no email/password)
- Add bookmarks with a title and URL
- Bookmarks are private per user — enforced with Row Level Security
- Real-time updates across browser tabs via Supabase Realtime
- Delete bookmarks
- Deployed on Vercel

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth + Database + Realtime**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the Supabase database

Go to your Supabase project dashboard, open the SQL Editor, paste the contents of `supabase-setup.sql`, and run it. This creates the `bookmarks` table with Row Level Security policies and enables Realtime.

### 5. Enable Google OAuth in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable the Google provider
3. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com)
4. Add the Supabase callback URL as an Authorised redirect URI in Google:
   `https://yicrdrxsoohrdvbzxrqa.supabase.co/auth/v1/callback`
5. Paste the Google Client ID and Client Secret into Supabase

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment on Vercel

1. Push the repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel will detect Next.js automatically
5. Copy the live Vercel URL and add it to Supabase:
   - Supabase Dashboard > Authentication > URL Configuration
   - Set **Site URL** to your Vercel URL (e.g. `https://smart-bookmark-app.vercel.app`)
   - Add `https://smart-bookmark-app.vercel.app/auth/callback` to **Redirect URLs**
   - Also add it as an Authorised redirect URI in your Google Cloud Console OAuth app

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── dashboard/page.tsx       # Protected dashboard (server component)
│   ├── login/page.tsx           # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root redirect
│   └── globals.css
├── components/
│   ├── BookmarksDashboard.tsx   # Realtime-enabled client component
│   ├── BookmarkList.tsx         # Bookmark items with delete
│   ├── AddBookmarkForm.tsx      # Add bookmark form
│   └── Header.tsx               # App header with sign-out
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client
│   └── types.ts                 # Shared TypeScript types
├── middleware.ts                 # Auth session refresh + route protection
├── supabase-setup.sql            # Database schema and RLS policies
└── .env.local
```

---

## Problems Encountered and Solutions

**1. Supabase Auth with Next.js App Router cookie handling**

The legacy `@supabase/auth-helpers-nextjs` package does not support the App Router's async cookie API. Switched to `@supabase/ssr` which provides `createBrowserClient` and `createServerClient` with full App Router support including the middleware pattern for session refresh.

**2. Real-time duplicate events on optimistic updates**

When a bookmark is inserted, both the optimistic state update and the Realtime INSERT event fired, causing a duplicate entry. Fixed by checking whether the incoming `payload.new.id` already exists in state before appending.

**3. Google OAuth redirect URL mismatch**

During local development the redirect went to `localhost`, which is not registered in Google Cloud Console. Fixed by dynamically generating the redirect URL from `window.location.origin` in the sign-in call, and registering both `localhost:3000` and the production Vercel URL in the Google OAuth app.

**4. Row Level Security blocking Realtime events**

Supabase Realtime respects RLS. Without the correct SELECT policy, the Realtime channel received no events. Ensured the `Users can view own bookmarks` SELECT policy was in place and the `bookmarks` table was added to the `supabase_realtime` publication.

**5. Vercel deployment: missing redirect URLs in Supabase**

After deploying to Vercel, the OAuth callback failed with a redirect mismatch error. Resolved by adding the production URL to both Supabase's Redirect URLs list and Google's Authorised redirect URIs.
