// בנייה ושרת סטטי לפיתוח. מופעל דרך: node --import tsx build.mjs [--serve] [--serve-only] [--watch]
import { build, context, transform } from "esbuild";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { he } from "./lib/i18n/he.ts";
import { normalizePaymentMode } from "./lib/payments/provider.ts";

const args = new Set(process.argv.slice(2));
const root = import.meta.dirname;
const dist = join(root, "dist");
const port = Number(process.env.PORT || 4173);

const rawMode = process.env.PAYMENT_MODE;
const paymentMode = normalizePaymentMode(rawMode);
if (rawMode && rawMode !== "disabled") {
  console.warn(`[warn] PAYMENT_MODE=${rawMode}: לא נרשם ספק סליקה, האתר ימשיך לפעול במצב disabled.`);
}
const siteUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");
if (!siteUrl) console.warn("[warn] SITE_URL לא הוגדר: sitemap ייווצר עם כתובת דוגמה, ו-canonical/og:url לא יוצגו.");

const hash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 10);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const buildOptions = {
  entryPoints: { app: join(root, "app/main.tsx") },
  bundle: true,
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  minify: true,
  sourcemap: true,
  outdir: join(dist, "assets"),
  entryNames: "[name]-[hash]",
  metafile: true,
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": '"production"',
    "globalThis.__PAYMENT_MODE__": JSON.stringify(paymentMode),
  },
};

async function finish(metafile) {
  const jsOut = Object.keys(metafile.outputs).find((f) => f.endsWith(".js"));
  const jsName = jsOut.split("/").pop();

  const css = readFileSync(join(root, "styles/global.css"), "utf8");
  const min = await transform(css, { loader: "css", minify: true });
  const cssName = `app-${hash(min.code)}.css`;
  writeFileSync(join(dist, "assets", cssName), min.code);

  const html = readFileSync(join(root, "index.html"), "utf8")
    .replaceAll("{{TITLE}}", esc(he.meta.title))
    .replaceAll("{{DESCRIPTION}}", esc(he.meta.description))
    .replaceAll("{{SITE_NAME}}", esc(he.meta.siteName))
    .replace("{{CANONICAL}}", siteUrl ? `<link rel="canonical" href="${esc(siteUrl)}/" />` : "")
    .replace("{{OG_URL}}", siteUrl ? `<meta property="og:url" content="${esc(siteUrl)}/" />` : "")
    .replace("{{CSS}}", `/assets/${cssName}`)
    .replace("{{JS}}", `/assets/${jsName}`);
  writeFileSync(join(dist, "index.html"), html);

  const base = siteUrl || "https://example.org";
  writeFileSync(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc></url>\n</urlset>\n`,
  );
  writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ""}`);

  if (existsSync(join(root, "public"))) cpSync(join(root, "public"), dist, { recursive: true });
  console.log(`[ok] dist/ מוכן (payment=${paymentMode})`);
}

function serve() {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
    ".map": "application/json",
  };
  createServer((req, res) => {
    const url = new URL(req.url || "/", "http://x");
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    if (p.includes("..")) p = "";
    let file = join(dist, p);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, "index.html");
    res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      "x-content-type-options": "nosniff",
    });
    res.end(readFileSync(file));
  }).listen(port, () => console.log(`[serve] http://localhost:${port}`));
}

if (args.has("--serve-only")) {
  serve();
} else if (args.has("--watch")) {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(join(dist, "assets"), { recursive: true });
  const ctx = await context({
    ...buildOptions,
    minify: false,
    plugins: [{ name: "html", setup: (b) => b.onEnd((r) => r.metafile && finish(r.metafile)) }],
  });
  await ctx.watch();
  if (args.has("--serve")) serve();
} else {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(join(dist, "assets"), { recursive: true });
  const result = await build(buildOptions);
  await finish(result.metafile);
  if (args.has("--serve")) serve();
}
