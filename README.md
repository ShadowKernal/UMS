# PrepMaster

Meal-prep planning web app built with Next.js and SQLite. The repo includes the
frontend + API routes in `web/` and a USDA FoodData Central JSON snapshot in
`fooddata/` for nutrition references.

## What is here

- `web/`: Next.js 14 app (App Router), TypeScript, Tailwind, SQLite-backed auth/admin.
- `fooddata/`: FoodData Central foundation foods JSON (source data).

## Prerequisites

- Node.js 18+ and npm

## Install and run (dev)

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

## Notes

- The app stores its dev SQLite database at `web/data/ums.sqlite3`.
- On first run, an admin account is auto-seeded; see `web/README.md` for the
  default credentials.

