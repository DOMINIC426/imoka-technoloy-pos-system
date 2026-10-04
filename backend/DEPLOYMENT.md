# Backend Deployment: Neon and Vercel

## Database setup

The Prisma schema and first migration are in `prisma/schema.prisma` and `prisma/migrations/20261004120000_init/migration.sql`. The migration creates users, persistent sessions, products, shifts, sales, sale items, and audit events, including their indexes and foreign keys. It seeds the six current demo products.

Configure these backend secrets in the hosting provider:

- `DATABASE_URL`: Neon pooled connection URI for runtime requests. Add Neon's `pgbouncer=true` parameter when using the pooler.
- `DIRECT_URL`: Neon direct, non-pooler connection URI for Prisma migrations.
- `ADMIN_INITIAL_PASSWORD`: Strong initial password for `imoka@technology.com`. The account is created only if that email does not yet exist.
- `CORS_ORIGINS`: Exact Vercel production origin, plus any preview origin that needs API access, comma-separated.
- `PORT`: Usually provided by the hosting platform; otherwise defaults to 3000.

Do not commit real URLs or passwords. The database URL previously shared in conversation should be rotated in Neon before deployment. Put replacement credentials only in the hosting provider's secret settings.

## Build and start

Build the backend from the `backend` directory. The Dockerfile installs dependencies and generates the Prisma client. The hosted start script runs `prisma migrate deploy` before starting the HTTP server. On a platform without this Dockerfile, use `npm install`, `npm run prisma:generate`, and `npm run start:hosted` as the build/start commands. Never use `prisma migrate dev` in production.

The repository includes `npm run prisma:migrate:dev` for local development. Set `DATABASE_URL` and `DIRECT_URL` in the local backend environment before running Prisma commands.

## Vercel frontend

Set `VITE_API_BASE_URL` in Vercel to the backend's public origin, for example `https://your-api-host.example.com`, without a trailing slash. Set it for each Vercel environment and rebuild the frontend after changing it. The frontend appends `/api/...` to this value.

Set the same frontend origin in backend `CORS_ORIGINS`, without a trailing slash. For local Docker Compose use `http://localhost:8080`. For Vercel previews, add the exact preview origins you permit; avoid wildcard origins for authenticated APIs.

## Shift behavior

Cashier logout deletes only that login session. It does not close the shift. The explicit `POST /api/shifts/close` action closes the shift, records the collected total through its linked sales, and detaches active sessions from that shift. PostgreSQL enforces at most one open shift per cashier.

## Data migration note

The previous backend used `/app/data/database.json`. This Prisma migration does not import that old JSON automatically. Before switching to hosted Neon, export the old JSON backup through the admin backup UI and plan a one-time import into the relational schema. The admin restore endpoint supports versioned relational backup JSON exports after deployment; legacy JSON database snapshots are not compatible with the new schema.
