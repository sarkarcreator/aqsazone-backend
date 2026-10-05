# Aqsa Zone Backend

API/backend for Aqsa Zone. This repository contains Next.js route handlers, MySQL/Drizzle data access, admin authentication and CORS.

## Local development

Create `.env.local` from `.env.example`, then:

```bash
npm install
npm run dev
```

API base:

```text
http://localhost:4000
```

## Database

The application uses MySQL through Drizzle ORM and `mysql2`. Set `DATABASE_URL` to a MySQL connection URL before starting the backend. The initial schema is defined in `src/db/schema.ts` and generated migrations are stored in `drizzle/`.

```bash
npm run db:generate
npm run db:migrate
```

Required environment variables:

- `DATABASE_URL` (MySQL connection URL, for example `mysql://user:password@db-host:3306/database`)

## Authentication

Set a strong production `ADMIN_PASSCODE`.

Firebase/Google admin login additionally requires:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## CORS

Set `FRONTEND_URL` or comma-separated `FRONTEND_URLS` to the Vercel/custom-domain origins that are allowed to call this API.

## Hostinger

Build:

```bash
npm install
npm run build
npm start
```

Run the Node/Next process behind the backend domain, for example:

```text
https://api.aqsazone.com
```

Then configure the Vercel frontend:

```env
NEXT_PUBLIC_API_URL=https://api.aqsazone.com
```
