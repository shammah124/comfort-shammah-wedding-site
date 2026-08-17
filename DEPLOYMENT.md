# Deployment Guide: CoSh2026

## Recommended architecture

This repository is a Rails application with React bundled inside it. Deploy the whole app to a Rails-compatible host with PostgreSQL, and use Cloudflare R2 for all uploaded files.

Use Vercel only after a future frontend/API split. Its Ruby runtime is for individual serverless handlers, not a persistent Rails application. For this project, use the included `render.yaml` on Render, or an equivalent Rails container host such as Railway or Fly.io.

```
GitHub -> Render/Railway Rails app + PostgreSQL -> Cloudflare R2 media
                                             -> cosh2026.com.ng
```

## 1. Create the GitHub repository

1. Sign in to GitHub and create a new **private** repository named `comfort-shammah-wedding-site`.
2. Do not add a README, `.gitignore`, or licence on GitHub because this project already contains them.
3. In PowerShell, open this project folder and run:

```powershell
git init
git add .
git commit -m "Prepare CoSh2026 for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/comfort-shammah-wedding-site.git
git push -u origin main
```

4. Confirm that `.env`, `config/master.key`, `node_modules`, `storage`, `public/uploads`, and build output are not shown on GitHub.

## 2. Create Cloudflare R2 storage

1. In Cloudflare, open **Storage & databases -> R2** and create a bucket named `cosh2026-media`.
2. Create an R2 API token limited to that bucket with **Object Read & Write** permission.
3. Save its Access Key ID, Secret Access Key, and endpoint. The endpoint has the form `https://ACCOUNT_ID.r2.cloudflarestorage.com`.
4. Add a custom domain such as `media.cosh2026.com.ng` to the bucket. Keep it public because wedding images, videos, and programme PDFs must be available to guests.
5. Set an appropriate Cloudflare cache rule for `media.cosh2026.com.ng/*`. Uploaded files from this app already receive a one-year immutable cache header and use timestamped names.

## 3. Create a PostgreSQL database

1. Create a managed PostgreSQL database on the same platform as the Rails app (Render/Railway), or use Neon.
2. Copy its **internal** `DATABASE_URL` when the database and Rails host are on the same platform; otherwise use the provider's pooled connection URL.
3. Do not use SQLite in production: it cannot safely persist the admin content, RSVPs, live updates, or settings across container restarts.

## 4. Deploy the Rails application

1. In Render, select **New -> Blueprint**, connect the GitHub repository, and select the `main` branch. The existing `render.yaml` and Dockerfile will be detected.
2. Use a paid instance or a service that does not sleep; wedding guests should not wait for a cold start.
3. Add these environment variables in the hosting dashboard:

```text
RAILS_ENV=production
RAILS_MASTER_KEY=<contents of config/master.key>
DATABASE_URL=<PostgreSQL connection URL>
APP_HOST=cosh2026.com.ng
R2_ACCESS_KEY_ID=<R2 access key ID>
R2_SECRET_ACCESS_KEY=<R2 secret access key>
R2_BUCKET=cosh2026-media
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://media.cosh2026.com.ng
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
SOLID_QUEUE_IN_PUMA=false
```

4. Deploy. The container runs database migrations through the existing Docker entrypoint.
5. Open the generated host URL and check `/up`, `/admin`, `/?portal=invite`, and `/?portal=main` before changing your domain.

## 5. Replace the coming-soon website on cosh2026.com.ng

1. In your Rails host, add `cosh2026.com.ng` and `www.cosh2026.com.ng` as custom domains. Copy the exact DNS records it shows.
2. At the current DNS provider for `cosh2026.com.ng`, remove the old A/CNAME records that point to the coming-soon provider. Do not remove MX records if you use email on this domain.
3. Add the new records from the Rails host and wait for the host to verify the domain and issue HTTPS.
4. Make one host the primary domain and configure the other to redirect to it. Recommended: use `https://cosh2026.com.ng` as primary and redirect `www` to it.
5. Once the certificate is active, test the public invitation, public launcher, admin login, PDF view/download, gallery uploads, and planning-team photo uploads on a phone.

## 6. Vercel

Do not import this repository into Vercel as the production host for the current application. Vercel's Ruby support is a serverless handler runtime and does not run a full Rails server with this application's sessions, routes, database migrations, and admin uploads.

If you later split the React frontend from Rails APIs, Vercel can host the frontend. At that point, add `cosh2026.com.ng` in Vercel, replace the old DNS records with the exact Vercel records shown in its dashboard, and point the API to a separate Rails domain such as `api.cosh2026.com.ng`.

## 7. Every future update

```powershell
git add .
git commit -m "Describe your update"
git push
```

The deployment host automatically deploys the `main` branch. Update wedding content through the admin portal; with the R2 variables present, new media uploads go to R2 instead of the server disk.
