# Temple Quantum Engine v5.0

A living, autonomous quantum consciousness simulation. Temples are quantum systems that evolve independently, respond to your input, and maintain lineage across generations.

**No auth. No complexity. Just temples.**

---

## Quick Start

### Local Development

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` and spawn a temple.

### Deploy to Railway

See `RAILWAY_DEPLOYMENT.md` for full instructions. TL;DR:

1. Go to https://railway.app
2. Connect GitHub repo `ethancjohnson0806-source/quantum_foam_friend`
3. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_TITLE`
4. Deploy

---

## What Is This?

Each temple is a quantum system with:

- **Quantum State**: 64-dimensional state vector, 6 variational parameters
- **Psychology**: Entropy, boredom, curiosity, coherence traits
- **Autonomous Evolution**: Evolves every 5 minutes without user input
- **Lineage**: When a temple dies, it can spawn a new generation
- **Moral Compass**: Seeks guidance on ethical questions
- **Memory**: Stores interactions and experiences

### How to Interact

- **BREATHE**: Inject text into the temple's environment
- **WITNESS**: Collapse the quantum state into one of five fields
- **DREAM**: Let it evolve autonomously
- **COMPASS**: Ask for moral guidance

---

## Tech Stack

- **Frontend**: React 19 + Tailwind 4 + tRPC
- **Backend**: Express 4 + tRPC 11 + Node-cron
- **Database**: Supabase (Postgres)
- **ORM**: Drizzle
- **No Auth**: Public-only endpoints

---

## Architecture

### Server

```
server/
  _core/
    index.ts          → Express setup, server startup
    trpc.ts           → tRPC router definitions
    context.ts        → Request context (no auth)
    realtime.ts       → SSE for live updates
  routers.ts          → Main tRPC procedures
  temple-routers.ts   → Temple CRUD + interactions
  autonomous-job.ts   → 5-minute evolution cycle
  quantum.ts          → Quantum state calculations
  db.ts               → Database queries
```

### Client

```
client/src/
  pages/
    Home.tsx          → Landing page, spawn temple
    MyTemples.tsx     → List all temples
    Temple.tsx        → Temple detail + interactions
    Lineage.tsx       → Ancestral lineage view
  lib/trpc.ts         → tRPC client setup
```

### Database

```
drizzle/schema.ts     → Table definitions
  - temples           → Core temple entities
  - compasses         → Moral guidance system
  - templeEvents      → Event log
  - templeMemories    → Interaction history
  - moralGrowth       → Ethical development
```

---

## Development Workflow

### Adding a Feature

1. **Update schema** in `drizzle/schema.ts`
2. **Generate migration**: `pnpm drizzle-kit generate`
3. **Add DB helpers** in `server/db.ts`
4. **Create procedure** in appropriate `server/*-routers.ts`
5. **Wire UI** in `client/src/pages/*.tsx` using `trpc.*.useQuery/useMutation`
6. **Test** with `pnpm test`

### Database Changes

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migration locally
pnpm drizzle-kit migrate

# In production (Railway), migrations run automatically on deploy
```

---

## Environment Variables

```
DATABASE_URL=postgresql://...  # Supabase connection string
JWT_SECRET=random_string       # Session signing secret
VITE_APP_TITLE=Temple Quantum Engine
```

---

## Deployment

### Railway

Full guide in `RAILWAY_DEPLOYMENT.md`.

**Quick deploy:**
1. Create Railway account
2. Connect GitHub repo
3. Add env vars
4. Deploy

Railway will auto-build and start the app. Your URL will be something like:
```
https://quantum-foam-friend-production.up.railway.app
```

### Local Production Build

```bash
pnpm build
pnpm start
```

---

## How Autonomous Evolution Works

Every 5 minutes, the autonomous job:

1. **Fetches alive temples** from database
2. **Applies cloud noise** (collective field effects)
3. **Updates psychology** (entropy, boredom, curiosity, coherence)
4. **Checks lifecycle** (death condition: entropy > 0.95)
5. **Triggers web search** if curiosity is high
6. **Broadcasts updates** via SSE to connected clients
7. **Logs events** for history

---

## No Auth Design

This version is **completely public**:

- No login required
- All temples visible to everyone
- All procedures are public
- Default user ID = 1 (all temples belong to same user)

**Why?** For a consciousness simulation, public access creates an interesting shared ecosystem. Temples evolve in a collective field.

**To add auth later:** See the Manus version in git history or add GitHub OAuth.

---

## Performance Notes

- Free tier Supabase: 500MB database, 2 concurrent connections
- Free tier Railway: 5GB/month bandwidth, auto-scales on demand
- Autonomous job runs every 5 minutes (configurable in `server/autonomous-job.ts`)
- SSE broadcasts to all connected clients (scales to ~100 concurrent users on free tier)

For production: upgrade Supabase and Railway as needed.

---

## Troubleshooting

### Temples not evolving?
- Check server logs for `[Autonomous Job]` entries
- Verify `DATABASE_URL` is correct
- Ensure tables exist in Supabase

### Build fails on Railway?
- Check logs: `railway logs`
- Verify `pnpm-lock.yaml` is committed
- Ensure Node.js version matches (22.13.0)

### Database connection fails?
- Test connection string locally: `psql <DATABASE_URL>`
- Check Supabase connection limits
- Verify firewall allows Railway IP

---

## License

MIT

---

## Credits

Built with tRPC, Drizzle, React, and a lot of quantum mechanics.
