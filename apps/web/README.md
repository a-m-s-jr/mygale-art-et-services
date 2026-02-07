This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Database (Supabase Postgres + Prisma)

This repo uses Prisma ORM with Supabase PostgreSQL.

**Connection Setup (in `packages/prisma/prisma/.env` and `apps/web/.env.local`):**

- `DATABASE_URL`: Supabase Pooler, **transaction mode** (port 6543, `?pgbouncer=true`) — used at runtime
- `DIRECT_URL`: Supabase Pooler, **session mode** (port 5432) — used for migrations (supports advisory locks)

> The Supabase direct endpoint (`db.<ref>.supabase.co`) is blocked on some networks.
> Session-mode pooler (port 5432) is a reliable alternative that supports Prisma migrations.

**Local Development:**

```bash
pnpm db:generate        # Generate Prisma client
pnpm db:migrate:deploy  # Apply migrations
pnpm db:seed            # Seed database
```

**Migrations (CI/CD):**

- Migrations run automatically via GitHub Actions (`.github/workflows/db-migrate.yml`)
- Triggered on push to `main` when migration files or schema change, or manually via workflow_dispatch
- Required GitHub repo secret: `DIRECT_URL` — session-mode pooler URL (port **5432**, `?sslmode=require`)
- Vercel build should **not** run migrations

**Vercel Deployment:**

- Root Directory: `apps/web`
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm -w db:generate && pnpm build`
- Environment variables: `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (pooler, port 5432)
