# Deploy guide

Target: a single Ubuntu 22.04/24.04 VPS (DigitalOcean, Linode, Hetzner, etc.) running the Next.js app + Postgres + Nginx + Let's Encrypt. 2 vCPU / 2 GB RAM is plenty for ~100 concurrent users.

A shorter Vercel + Supabase path is at the bottom if you'd rather not run a server.

---

## Architecture

```
                                  VPS (Ubuntu)
                  ┌────────────────────────────────────────┐
  Browser ──443──▶│ Nginx ──reverse_proxy──▶ next start    │
                  │  (TLS via certbot)        :3000 (loopback)
                  │                            │
                  │                            ▼
                  │                       Postgres (localhost:5432)
                  └────────────────────────────────────────┘
```

App listens on `127.0.0.1:3000` (never directly internet-facing). Nginx terminates TLS and proxies. systemd keeps the process alive. ufw opens only 22, 80, 443.

---

## 1. Provision the droplet

Ubuntu 24.04 LTS. SSH in as root, then create a deploy user and lock down SSH:

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# /etc/ssh/sshd_config:
#   PasswordAuthentication no
#   PermitRootLogin no
systemctl reload ssh

ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```

From here on, work as `deploy`.

## 2. Install Node 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v20.x
```

## 3. Install Postgres

```bash
sudo apt-get install -y postgresql
sudo -u postgres createuser --pwprompt worldcup
sudo -u postgres createdb -O worldcup worldcup
```

Your DB URL is now: `postgresql://worldcup:PASSWORD@localhost:5432/worldcup`

## 4. Clone and configure

```bash
cd /home/deploy
git clone https://github.com/<you>/world-cup-tipping-app.git
cd world-cup-tipping-app
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://worldcup:PASSWORD@localhost:5432/worldcup"
SESSION_SECRET="<openssl rand -hex 32>"
ADMIN_SECRET="<openssl rand -hex 32>"
```

## 5. Install, push schema, seed, build

```bash
npm ci
npm run db:push    # creates all tables
npm run db:seed    # loads 48 teams + 104 fixtures
npm run build
```

Sanity check: `npm test` should print "All scoring tests passed."

## 6. systemd service

`/etc/systemd/system/worldcup.service`:

```ini
[Unit]
Description=World Cup Tipping App
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/world-cup-tipping-app
EnvironmentFile=/home/deploy/world-cup-tipping-app/.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now worldcup
sudo systemctl status worldcup
journalctl -u worldcup -f    # tail logs
```

## 7. Nginx reverse proxy

```bash
sudo apt-get install -y nginx
```

`/etc/nginx/sites-available/worldcup`:

```nginx
server {
    listen 80;
    server_name your-domain.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/worldcup /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8. DNS + TLS

Point an A record for `your-domain.example.com` at the droplet IP. Wait for propagation, then:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example.com
```

certbot rewrites the Nginx config to add the 443 server block + 80→443 redirect, and schedules auto-renewal via a systemd timer.

## 9. Backups

Nightly Postgres dump in `/etc/cron.daily/worldcup-backup`:

```bash
#!/bin/sh
sudo -u postgres pg_dump worldcup | gzip > /var/backups/worldcup-$(date +%F).sql.gz
find /var/backups -name 'worldcup-*.sql.gz' -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/worldcup-backup
```

Add an `rclone` push to S3/Backblaze if you want offsite copies.

## 10. Updates workflow

```bash
cd /home/deploy/world-cup-tipping-app
git pull
npm ci
npm run db:push           # only if schema changed
npm run build
sudo systemctl restart worldcup
```

## 11. Record results in production

Visit `https://your-domain.example.com/admin`, paste your `ADMIN_SECRET` (sets a JWT cookie good for 1 day), and enter match and tournament results as they happen. The leaderboard updates immediately.

---

## Verification

After step 8 finishes, walk through:

1. `curl -I https://your-domain.example.com` → `200 OK` over HTTPS.
2. Register a user in the browser, submit a match prediction, confirm it saves.
3. `/admin` → log in → enter a fake result → leaderboard updates.
4. `sudo systemctl restart worldcup` mid-session → session cookie survives (JWTs are stateless).
5. `journalctl -u worldcup --since "5 min ago"` → no error spam.

---

## Notes

- **Re-seeding wipes match fixtures** (`prisma.match.deleteMany()` in `prisma/seed.ts`). Don't re-run `db:seed` after users have predictions — cascade delete removes them too.
- **Schema changes** later: use `npx prisma migrate dev --name <change>` locally to commit a migration file, then `npm run db:migrate` on the VPS instead of `db:push`.
- **Capacity**: bottleneck for this app is the human admin entering scores. The box will sit idle most of the time. Vertical scale first if you ever need to.

---

## Alternative: Vercel + Supabase

If you'd rather not run a server, the original deployment target works too:

1. Sign up at [supabase.com](https://supabase.com) → New project. Save the DB password.
2. Settings → Database → Connection string → copy the **Transaction pooler** URL (port 6543, append `?pgbouncer=true`). Put it in `DATABASE_URL`.
3. For Supabase migrations you need a direct URL too. Re-add this line under `datasource db` in `prisma/schema.prisma`:
   ```
   directUrl = env("DIRECT_URL")
   ```
   and set `DIRECT_URL` to the **Direct connection** URL (port 5432).
4. Locally: `npm install && npm run db:push && npm run db:seed`.
5. Push the repo to GitHub. Sign in at [vercel.com](https://vercel.com) → Add New → Project → import the repo. Add `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `ADMIN_SECRET` as environment variables. Deploy.
6. The site is live at `https://<project>.vercel.app`. Push to `master` to redeploy.

Supabase pauses inactive free-tier projects after ~7 days — reactivate with one click, no data loss.
