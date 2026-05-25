# World Cup Tipping App 2026

A web app for predicting FIFA World Cup 2026 match scores and tournament outcomes. Users register with email, earn points from match predictions, and compete on a public leaderboard.

## Scoring

### Matches (best single tier per match)

| Tier | Points | Example |
|------|--------|---------|
| Exact score | 5 | Predict 3:2, result 3:2 |
| Goal difference | 2 | Predict 3:2 (+1), result 2:1 (+1) |
| Winner / draw | 1 | Predict 2:0 (home win), result 1:0 (home win) |

### Tournament (before kickoff)

| Pick | Points each |
|------|-------------|
| Semi-finalist (up to 4 correct) | 3 |
| Finalist (up to 2 correct) | 5 |
| Champion | 10 |

## Quick start

You need a Postgres database. The simplest setup is a free Supabase project — see [DEPLOY.md](DEPLOY.md) for the 2-minute walkthrough — then:

```bash
cd world-cup-tipping-app
cp .env.example .env           # fill in Supabase URLs + secrets
npm install
npm run db:push                # create schema in Supabase
npm run db:seed                # load teams + fixtures
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is seeded with all **48 official 2026 teams** (groups A–L), **72 group-stage matches**, and **32 knockout matches** (Round of 32 → Final, matches 73–104) using FIFA bracket slot labels. See `/format` for qualification and tie-breaker rules. Re-run `npm run db:seed` to refresh fixtures.

## Admin

Visit `/admin` to record real match and tournament results and manage other users. Admin is per-user — see `DEPLOY.md` for how to promote your first user.

## Stack

- Next.js 15 (App Router)
- Prisma + Postgres (Supabase)
- Email/password auth with HTTP-only session cookie
