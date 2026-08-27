# Deploying the GATD backend + database on Namecheap cPanel

**All three (frontend, backend, database) run on Namecheap cPanel.** The frontend is a
Next.js **static export** (plain HTML/CSS/JS — no Node process); the backend is a Node
app; the database is MySQL.

**This deployment's concrete values:**
- Website (frontend, static): **`https://gatd.com`** (+ `www.gatd.com`) — static files in a cPanel docroot.
- API (backend, Node app): **`https://api.gatd.com`**.
- Database: MySQL on the same account.
- cPanel account **primary** domain: `globalatd.com` (home `/home/globghnp`) — the client's
  existing site, **left untouched**. `gatd.com` is a **different** domain added here for the
  new project.
- **DNS:** point `gatd.com`'s nameservers to Namecheap hosting (`dns1.namecheaphosting.com` /
  `dns2.namecheaphosting.com`) so both `gatd.com` and `api.gatd.com` resolve here
  automatically (step 1). This changes only `gatd.com`; `globalatd.com` is unaffected.

Everywhere below, the frontend host is `gatd.com` and the API host is `api.gatd.com`.

> Prerequisite: a Namecheap plan with **Node.js** support in cPanel (Stellar Plus /
> Business, or any plan that shows **Setup Node.js App**). If you don't see that
> tool in cPanel, the plan can't run Node — ask Namecheap to enable it/upgrade.

---

## 0. Coexisting safely with an existing site + database

The deploy is **additive**: you only ever *create new* resources, each with its own
name. You never open, edit, or point at anything the existing site uses. If done as
below, the old website and database keep running untouched.

**The "never touch" rules**
- **New database, never the existing one.** Create a fresh DB (`cpuser_gatd`) + a
  fresh user scoped **only** to it. Never import into, or grant your user access to,
  the existing database. (Different databases are fully isolated — even a table named
  `programs` in the new DB can't collide with the old site's tables.)
- **New subdomain with its OWN document root**, outside the existing site's
  `public_html`. cPanel writes a Passenger `.htaccess` into that subdomain's docroot
  only — so the live site's `.htaccess` is never modified.
- **App files in a separate home folder** (e.g. `~/gatd-api`) — never inside the
  existing site's `public_html`.
- **In phpMyAdmin, confirm the NEW database is selected** (left panel) before every
  Import. Importing into the wrong DB is the only real way to affect the old data.
- **Do NOT run `npm run db:setup` on the server** — that script targets a local dev
  DB (`mysql -u root gatd`). Import via phpMyAdmin instead.
- **Don't reuse the existing site's DB credentials** in your `.env` — fresh creds only.

**Before you start (5-minute pre-flight)**
1. **Back up the existing DB** anyway: phpMyAdmin → select the old DB → Export (quick,
   SQL). Cheap insurance even though we won't touch it.
2. **Check resource headroom:** cPanel → *Metrics → Resource Usage* and *Statistics*
   (Disk, **Inodes**, Entry Processes, Physical Memory). A Node app adds a persistent
   process + `node_modules` (thousands of files). Make sure there's room; if the
   account is near its inode or memory cap, sort that with Namecheap first.
3. **Check quotas:** enough remaining **MySQL databases**, **subdomains**, and that
   **Node apps** are allowed on the plan.

**Shared-resource etiquette (the only thing "shared" between old and new)**
- **MySQL connections** are server-wide. Keep the new pool small so it can't starve
  the old site: set `connectionLimit` in `src/config/db.js` to ~5.
- **Memory/CPU:** the Node process runs continuously. If the account is tight, that's
  the one thing that could indirectly pressure the old site — watch Resource Usage
  after launch.

**Rollback (nothing is permanent)** — because it's all isolated, undoing is clean and
never affects the old site: Setup Node.js App → **Delete** the app; **Remove** the
`api` subdomain; drop the **new** database + user; delete the `~/gatd-api` folder.

---

## 1. Point gatd.com here + create the two domains

Since **everything is on cPanel**, make Namecheap hosting authoritative for gatd.com:

1. At gatd.com's registrar, set its **nameservers** to `dns1.namecheaphosting.com`
   and `dns2.namecheaphosting.com`, then wait for propagation. (Affects only
   `gatd.com`; the existing `globalatd.com` site is untouched.)
2. cPanel → **Domains → Create A New Domain** (twice), each with **"Share document
   root" unchecked**:
   - **`gatd.com`** — the frontend. Note its doc root (e.g. `/home/globghnp/gatd.com`);
     the static site goes here (step 10).
   - **`api.gatd.com`** — the backend. Separate doc root (e.g. `/home/globghnp/api.gatd.com`).

Once nameservers propagate, both resolve here automatically — no manual A records, and
the "domain pointed to remote nameservers" validation prompt goes away.

> **Alternative** (keep gatd.com DNS elsewhere): leave nameservers as-is, validate each
> domain via cPanel's **DNS-based (TXT)** method, and add A records `@`, `www`, and `api`
> → your cPanel **Shared IP** (right sidebar → *General Information*).

---

## 2. Create the MySQL database + user

cPanel → **MySQL® Databases**:
1. **Create database** `gatd` → real name becomes `cpuser_gatd` (cPanel adds your account prefix).
2. **Add a MySQL user** `gatd_user` (→ `cpuser_gatd_user`) with a strong password.
3. **Add user to database** → grant **ALL PRIVILEGES**.

Note the final prefixed names — you'll put them in the env vars.
`DB_HOST=localhost`, `DB_PORT=3306`.

---

## 3. Import the schema

cPanel → **phpMyAdmin** → select `cpuser_gatd` → **Import** tab → upload and run
each file (order doesn't matter — no cross-file foreign keys):

- `database/schema.sql`            (programs catalog + registrations + admin_users, seeds the 8 programmes)
- `database/solutions_schema.sql`  (parent/child solutions + solution_programs)
- `database/contact_schema.sql`    (contact_messages)
- `database/brochure_schema.sql`   (brochure_leads)

Verify the tables appear in phpMyAdmin afterwards.

---

## 4. Upload the backend code

Deploy **only this `backend/` app** — not the frontend, not `node_modules`, not `.env`.

**Easiest (zip):** zip these and upload via **File Manager** into the app folder
(e.g. `~/gatd-api`), then Extract:
```
app.js  package.json  package-lock.json  src/  database/  README.md
```
**Alternative (Git):** cPanel → **Git Version Control** → clone your repo, then set
the Node app's *Application root* to the repo's `backend/` subfolder.

Do **not** upload `node_modules` (installed on the server) or your local `.env`.

---

## 5. Create the Node.js application

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 18.x or 20.x (latest LTS offered) |
| Application mode | **Production** (this sets `NODE_ENV=production`) |
| Application root | `gatd-api` (where you uploaded the files) |
| Application URL | `api.gatd.com` |
| Application startup file | `app.js` |

Click **Create**. Passenger now manages the process (auto-starts, auto-restarts on
crash — no PM2 needed). Do **not** set a `PORT` — Passenger injects it and the app
reads `process.env.PORT`.

---

## 6. Set environment variables

In the Node.js App screen, **Add Variable** for each (or upload a `.env` in the app
root — but if you do, omit `PORT`):

```
NODE_ENV=production                 # set automatically by "Production" mode
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpuser_gatd                 # your prefixed DB name
DB_USER=cpuser_gatd_user            # your prefixed DB user
DB_PASSWORD=your-db-password
JWT_SECRET=<long-random-string>     # generate a NEW one, e.g. `openssl rand -hex 48`
JWT_EXPIRES_IN=12h
ADMIN_SIGNUP_KEY=<your-signup-key>  # keep private; needed to create admin accounts
CORS_ORIGINS=https://gatd.com,https://www.gatd.com

# Email (SMTP) — registration confirmation + internal notification.
# The app runs ON the cPanel mail server, so send via localhost (avoids the
# firewall / SMTP-restrictions / NAT-hairpin issues you hit using the public host).
SMTP_HOST=localhost
SMTP_PORT=465                       # 465 (SSL) or 587 (STARTTLS)
SMTP_SECURE=true                    # true for 465
SMTP_TLS_REJECT_UNAUTHORIZED=false  # localhost cert won't match "localhost"
SMTP_USER=register@globalatd.com    # the cPanel mailbox login
SMTP_PASSWORD=<mailbox-password>
MAIL_FROM=GATD <register@globalatd.com>
MAIL_NOTIFY=register@globalatd.com  # internal copy of every registration
```

> **Local dev** connects over the internet, so there use `SMTP_HOST=globalatd.com`
> and leave `SMTP_TLS_REJECT_UNAUTHORIZED` unset (the cert matches). Only
> production (on-server) needs `localhost` + the relaxed cert check.

- **CORS_ORIGINS** must list the exact origin(s) the site is served from (no trailing
  slash). If it's wrong, the browser blocks every API call.
- **Generate a fresh `JWT_SECRET`** for production (don't reuse the dev value).
- **SMTP:** create the `register@globalatd.com` mailbox in cPanel → *Email Accounts*
  first, then use its credentials here. Find the exact host/port under cPanel →
  *Email Accounts → Connect Devices*. If SMTP vars are left blank, registrations
  still save — only the emails are skipped (a warning is logged).

---

## 7. Install dependencies & start

In the Node.js App screen click **Run NPM Install** (installs express, cors, dotenv,
mysql, bcryptjs, jsonwebtoken, exceljs — all pure-JS, no compiler needed). Then click
**Restart**.

Sanity check (browser or curl):
```
https://api.gatd.com/health      → {"status":"ok"}
https://api.gatd.com/apis/programs → the 8 seeded programmes
```

---

## 8. Enable HTTPS (both domains)

cPanel → **SSL/TLS Status** → tick **`api.gatd.com`**, **`gatd.com`**, **`www.gatd.com`**
→ **Run AutoSSL** (Let's Encrypt). Everything must be HTTPS or browsers block mixed content.

---

## 9. Create the first admin account

```bash
curl -X POST https://api.gatd.com/apis/auth/signup \
  -H "Content-Type: application/json" \
  -H "x-signup-key: <ADMIN_SIGNUP_KEY>" \
  -d '{"name":"Admin","email":"you@gatd.com","password":"a-strong-password"}'
```
Then log in at `https://gatd.com/admin/`. (Keep `ADMIN_SIGNUP_KEY` private; rotate it
once the needed accounts exist.)

---

## 10. Deploy the frontend (static export) to gatd.com

The site is a Next.js **static export** — build it locally, then upload the output.

1. In `frontend/`, create **`.env.production`** (copy `.env.production.example`):
   ```
   NEXT_PUBLIC_ADMIN_API=https://api.gatd.com/apis
   NEXT_PUBLIC_REGISTRATIONS_API=https://api.gatd.com/apis/registrations
   NEXT_PUBLIC_CONTACT_API=https://api.gatd.com/apis/contact
   NEXT_PUBLIC_BROCHURE_API=https://api.gatd.com/apis/brochure-leads
   ```
   (Leave `NEXT_PUBLIC_SIGNUP_KEY` unset — anything `NEXT_PUBLIC_*` ships to the browser.)
2. `npm install` then **`npm run build`** → produces the **`out/`** folder.
3. Upload the **contents of `out/`** (not the folder itself) into gatd.com's document
   root (e.g. `/home/globghnp/gatd.com`) — File Manager (zip → upload → Extract) or FTP.
   `index.html` must sit directly in the docroot.
4. Test `https://gatd.com` and the dashboard at `https://gatd.com/admin/`.

`trailingSlash: true` is set, so every route is `route/index.html` — clean URLs and
admin deep-link refreshes work on Apache with no `.htaccess` rewrites.

**Rebuilding after changes:** re-run `npm run build` locally and re-upload `out/`.

---

## Updating later

Upload changed files (or `git pull`), then **Restart** the app in Setup Node.js App
(or `touch tmp/restart.txt` in the app root). Env-var changes also require a Restart.
Schema changes → re-run the relevant `.sql` in phpMyAdmin.

## Troubleshooting

| Symptom | Fix |
|---|---|
| 503 / "Passenger" error page | Check the app log (Setup Node.js App → the app's `stderr.log`, or `~/logs`). Usually a crash on DB connect. |
| App won't start | If it fails binding the host, change `app.listen(PORT, HOST, …)` to `app.listen(PORT, …)` in `app.js` and restart. |
| `ER_ACCESS_DENIED` / DB connect fails | Wrong **prefixed** `DB_NAME`/`DB_USER`, wrong password, or user not added to the database. |
| `Too many connections` | Lower `connectionLimit` in `src/config/db.js` (e.g. 5) — shared hosting caps concurrent MySQL connections. |
| CORS error in browser console | `CORS_ORIGINS` is missing the exact frontend origin (scheme + host, no trailing slash). |
| Rate-limited (429) unexpectedly | Expected under heavy testing; loopback bypass is dev-only, so production enforces 5–10/10min per IP. |
