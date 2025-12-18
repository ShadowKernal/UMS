// Simple launcher so you can start the Next.js app with `node start.js`
// Uses the Next.js programmatic API to run the dev server on port 3000.

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = require("http").createServer((req, res) => handle(req, res));
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`UMS Next.js app ready on http://localhost:${port} (dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js", err);
    process.exit(1);
  });
