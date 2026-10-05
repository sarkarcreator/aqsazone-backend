# Aqsa Zone Backend

API/backend for Aqsa Zone. This repository contains Next.js route handlers, PostgreSQL/Drizzle data access, admin authentication and CORS.

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

The application uses PostgreSQL.

```bash
npm run db:generate
npm run db:migrate
```

Required environment variables:

- `SQL_HOST`
- `SQL_USER`
- `SQL_PASSWORD`
- `SQL_DB_NAME`

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
