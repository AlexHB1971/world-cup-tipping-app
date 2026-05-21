# World Cup Predictions 2026

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

```bash
cd world-cup-predictions
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is seeded with all **48 official 2026 teams** (groups A–L), **72 group-stage matches**, and **32 knockout matches** (Round of 32 → Final, matches 73–104) using FIFA bracket slot labels. See `/format` for qualification and tie-breaker rules. Re-run `npm run db:seed` to refresh fixtures.

## Admin

Visit `/admin` and enter your `ADMIN_SECRET` to record real match and tournament results. This unlocks leaderboard scoring.

## Stack

- Next.js 15 (App Router)
- Prisma + SQLite
- Email/password auth with HTTP-only session cookie
