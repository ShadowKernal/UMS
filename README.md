# PrepMaster

PrepMaster is a Next.js app for managing users and study prep workflows. It ships with optional Postgres (Neon) storage, email notifications, and Google OAuth.

## Tech

- Next.js 14 / React 18
- TypeScript, Tailwind CSS, MUI
- Neon serverless Postgres (optional)
- Nodemailer SMTP (optional)

## Getting started

```bash
cd web
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment variables

Create a `.env.local` in `web/` if you want to enable integrations.

```bash
# Database
PREPMASTER_ENABLE_DB=true
DATABASE_URL=postgres://user:pass@host/db

# SMTP (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM=no-reply@example.com
SMTP_SECURE=false

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

If `PREPMASTER_ENABLE_DB` is not set to `true`, the app uses a no-op database adapter and skips persistence.

## Scripts (web)

```bash
npm run dev
npm run build
npm run start
npm run lint
```
