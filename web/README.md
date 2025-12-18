# UMS Next.js rewrite

TypeScript/Next.js version of the User Management System demo. It replaces the Python HTTP server with Next.js API routes and keeps SQLite for persistence.

## Prerequisites

- Node.js 18+ and npm

## Install & run

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

## Features ported

- Auth flows: signup, login, logout, logout-all, email verification, password reset
- Session + CSRF cookies using Next.js route handlers
- SQLite schema and dev email outbox preserved
- Basic admin user listing

The app automatically seeds an admin account (`admin@example.com` / `admin123!`) on first run; credentials are also written to the dev outbox.
