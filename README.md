# Aqsa Zone Backend

Next.js API for the Aqsa Zone portfolio and admin CMS. Content data and administrator credentials are stored in MySQL; Firebase Authentication is not used by the backend.

## Local development

Create `.env.local` from `.env.example`, then run:

```bash
npm install
npm run dev
```

API base: `http://localhost:4000`.

## Database

Set `DATABASE_URL` to your MySQL connection URL. Content schema migrations live in `drizzle/`.

```bash
npm run db:migrate
```

The first request to `/api/admin/setup` creates the small `admin_accounts` table if needed. The setup page creates the first administrator using a scrypt password hash. A named MySQL lock prevents concurrent first-account creation; once an account exists, public setup is permanently disabled unless the account is deliberately removed from the database.

## Admin authentication

Required environment variables:

- `DATABASE_URL`: MySQL connection URL.
- `ADMIN_SESSION_SECRET`: unique random secret, at least 32 characters; generate with `openssl rand -base64 48`.
- `FRONTEND_URL` or `FRONTEND_URLS`: exact frontend origin(s) allowed by CORS.

Open `/admin/login` on the frontend. If no admin exists, the page presents the one-time setup form. Afterwards, sign in with the admin email and password. Sessions are HMAC-signed, expire after 12 hours, and are stored in HttpOnly cookies. There is no public signup, Firebase login, default passcode, or email password-reset flow.

For cross-origin cookies, use HTTPS in production and configure the exact frontend origin in CORS. A custom frontend domain on the same site as the API is recommended.

## Hostinger deployment

Deploy the repository as a Node.js Web App using a supported Node version. Set the environment variables above in hPanel. Build with `npm run build`; start with `npm start` (uses Hostinger's `PORT` when provided).

Example API domain: `https://api.aqsazone.com`.

Set the frontend's Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.aqsazone.com
```
