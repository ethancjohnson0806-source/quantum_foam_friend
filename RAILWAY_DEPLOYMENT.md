# Railway + Supabase Deployment Guide

## Prerequisites

- GitHub account (already set up)
- Supabase account (already set up)
- Railway account (free at https://railway.app)

## Step 1: Set Up Supabase Database

1. Go to your Supabase project: https://hzukazvhhixtmsuwqfcp.supabase.co
2. Click **Settings** → **Database** → copy the **Connection String (URI)**
3. Keep this handy for Railway env vars

## Step 2: Create Database Tables

Run the SQL migrations in Supabase:

1. Go to **SQL Editor** in Supabase
2. Create a new query and run the schema creation SQL (see `drizzle/migrations/` for the latest migration)
3. Or use `pnpm drizzle-kit generate` locally to generate migrations

## Step 3: Deploy to Railway

### Option A: Connect GitHub (Recommended)

1. Go to https://railway.app and sign up
2. Click **New Project** → **Deploy from GitHub**
3. Select `ethancjohnson0806-source/quantum_foam_friend`
4. Railway will auto-detect the Node.js project
5. Add environment variables (see below)
6. Deploy!

### Option B: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway link  # Select your project
railway up
```

## Step 4: Set Environment Variables in Railway

In the Railway dashboard, add these variables:

```
DATABASE_URL=postgresql://postgres:[ichooseyouagain]@db.hzukazvhhixtmsuwqfcp.supabase.co:5432/postgres

VITE_APP_ID=[from Manus]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

JWT_SECRET=[generate a random string]
OWNER_OPEN_ID=[your Manus user ID]
OWNER_NAME=[your name]

BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=[from Manus]
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=[from Manus]

VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=[from Manus]

VITE_APP_TITLE=Temple Quantum Engine
VITE_APP_LOGO=https://example.com/logo.png
```

## Step 5: Verify Deployment

1. Railway will show your app URL (e.g., `https://quantum-foam-friend-production.up.railway.app`)
2. Visit the URL and test:
   - Sign in with Manus OAuth
   - Create a temple
   - Check if autonomous job runs (new events every 5 minutes)

## Troubleshooting

### Build fails
- Check logs: `railway logs`
- Ensure `pnpm-lock.yaml` is committed to git
- Verify Node.js version matches local (22.13.0)

### Database connection fails
- Verify `DATABASE_URL` is correct in Railway env vars
- Check Supabase connection limits (free tier: 2 concurrent connections)
- Ensure tables exist in Supabase

### OAuth fails
- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Check that redirect URL is whitelisted in Manus OAuth settings

## Local Development

```bash
pnpm install
pnpm dev
```

Then visit `http://localhost:3000`

## Production Notes

- Railway auto-scales on demand (free tier: 1 project, 5GB/month)
- Supabase free tier: 500MB database, 2 concurrent connections
- For production: upgrade both services as needed
