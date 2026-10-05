# Backend Deployment: Neon and Vercel

## Database setup

The Prisma schema and migrations are in `prisma/schema.prisma` and `prisma/migrations/`. They create users, persistent sessions, password reset codes, products, shifts, sales, sale items, and audit events, including their indexes and foreign keys. The initial migration seeds the six current demo products.

Configure these backend secrets in the hosting provider:

- `DATABASE_URL`: Neon pooled connection URI for runtime requests. Add Neon's `pgbouncer=true` parameter when using the pooler.
- `DIRECT_URL`: Neon direct, non-pooler connection URI for Prisma migrations.
- `ADMIN_INITIAL_PASSWORD`: Strong initial password for `imoka@technology.com`. The account is created only if that email does not yet exist.
- `CORS_ORIGINS`: Exact Vercel production origin, plus any preview origin that needs API access, comma-separated.
- `PORT`: Usually provided by the hosting platform; otherwise defaults to 3000.
- `SMTP_HOST`: Gmail SMTP host, `smtp.gmail.com`.
- `SMTP_PORT`: Gmail implicit TLS port, `465`.
- `SMTP_SECURE`: `true` when using port 465.
- `SMTP_USER`: `imokaprints@gmail.com`.
- `SMTP_APP_PASSWORD`: A newly generated Google app password. Do not reuse an app password shared in chat.
- `SMTP_FROM`: `Imoka Co Ltd <imokaprints@gmail.com>`.
- `SHIFT_EMAIL_TO`: Notification recipient, `imokaprints@gmail.com`.

Do not commit real URLs or passwords. The database URL previously shared in conversation should be rotated in Neon before deployment. Put replacement credentials only in the hosting provider's secret settings.

Create a local `backend/.env` from `backend/.env.example` and fill its SMTP app password privately. The local start script reads this ignored file; Vercel does not read repository `.env` files, so add each SMTP variable under the Vercel project's backend environment-variable settings for the environments where notifications should run.

## Deploying this backend to Vercel

Set the Vercel project root directory to `backend`. Vercel discovers `api/index.js`, which re-exports the ES-module handler from `src/server.js`. The entrypoint is not an Express app, so do not add `module.exports = app`.

Vercel build runs `npm run build`, and `postinstall` also runs `prisma generate`; the Prisma schema includes `rhel-openssl-3.0.x` for Vercel's Linux runtime. These generate the Prisma client but intentionally do not apply migrations during preview or production builds. Apply the checked-in migration once, before directing production traffic, using a trusted environment with `DIRECT_URL` configured and `npm run prisma:migrate:deploy`. Do not run `prisma migrate dev` against production.

Use Neon's pooled URL for `DATABASE_URL` at runtime. Vercel functions are short-lived/serverless; the old `start:hosted` Docker command is for a persistent Node/Docker host and is not Vercel's function start command.

The repository includes `npm run prisma:migrate:dev` for local development. Set `DATABASE_URL` and `DIRECT_URL` in the backend environment before running Prisma commands.

## Vercel frontend

Set `VITE_API_BASE_URL` in Vercel to the backend's public origin, for example `https://your-api-host.example.com`, without a trailing slash. Set it for each Vercel environment and rebuild the frontend after changing it. The frontend appends `/api/...` to this value.

Set the same frontend origin in backend `CORS_ORIGINS`, without a trailing slash. For local Docker Compose use `http://localhost:8080`. For Vercel previews, add the exact preview origins you permit; avoid wildcard origins for authenticated APIs.

Password recovery sends a six-digit code through the configured SMTP account. Codes expire after 10 minutes, allow up to five verification attempts, and are stored as salted hashes. Before enabling the recovery link in production, apply all pending Prisma migrations, including `20261005100000_add_password_reset_codes`, and configure the SMTP variables in Vercel.

## Shift behavior

Cashier logout deletes only that login session. It does not close the shift. The explicit `POST /api/shifts/close` action closes the shift, records the collected total through its linked sales, and detaches active sessions from that shift. PostgreSQL enforces at most one open shift per cashier.

## Data migration note

The previous backend used `/app/data/database.json`. This Prisma migration does not import that old JSON automatically. Before switching to hosted Neon, export the old JSON backup through the admin backup UI and plan a one-time import into the relational schema. The admin restore endpoint supports versioned relational backup JSON exports after deployment; legacy JSON database snapshots are not compatible with the new schema.
