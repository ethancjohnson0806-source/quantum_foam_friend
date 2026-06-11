# Railway + Supabase Deployment Guide

## Overview

This is a **no-auth** version of Temple Quantum Engine that runs on Railway + Supabase. No login required—just visit and start creating temples.

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
DATABASE_URL=postgresql://postgres:ichooseyouagain@db.hzukazvhhixtmsuwqfcp.supabase.co:5432/postgres
JWT_SECRET=your_random_secret_here
VITE_APP_TITLE=Temple Quantum Engine
```

That's it! No OAuth, no Manus APIs, no complexity.

## Step 5: Verify Deployment

1. Railway will show your app URL (e.g., `https://quantum-foam-friend-production.up.railway.app`)
2. Visit the URL and:
   - Click "SPAWN NEW TEMPLE" to create a temple
   - Visit `/my-temples` to see all temples
   - Click on a temple to interact with it

## How It Works (No Auth)

- **No login required**: Everyone accesses the same temple network
- **All temples are public**: Anyone can view and interact with all temples
- **Default user ID**: All temples are created under a default user (userId = 1)
- **Autonomous evolution**: Temples evolve every 5 minutes automatically

## Troubleshooting

### Build fails
- Check logs: `railway logs`
- Ensure `pnpm-lock.yaml` is committed to git
- Verify Node.js version matches local (22.13.0)

### Database connection fails
- Verify `DATABASE_URL` is correct in Railway env vars
- Check Supabase connection limits (free tier: 2 concurrent connections)
- Ensure tables exist in Supabase

### Temples not evolving
- Check if autonomous job is running: look for `[Autonomous Job]` in server logs
- Verify database connection is working
- Check if any errors in the logs

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
- Consider adding authentication later if you want per-user temples

## Removing Manus Dependencies

This version has been stripped of all Manus-specific code:
- ✅ Removed OAuth (Manus login)
- ✅ Removed Manus APIs (LLM, storage, notifications)
- ✅ Removed protected procedures
- ✅ Simplified to public-only endpoints
- ✅ Uses standard Supabase for data

The app is now fully independent and can run anywhere Node.js is supported.
