# PrepMastere

Meal-prep planning web app built with Next.js. The repo includes the frontend +
API routes in `web/` and a USDA FoodData Central JSON snapshot in `fooddata/`
for nutrition references.

## What is here

- `web/`: Next.js 14 app (App Router), TypeScript, Tailwind.
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

- Auth/admin APIs are disabled until a database driver is added.
- To re-enable, add a DB driver and set `PREPMASTER_ENABLE_DB=true`.
