/**
 * Local reproduction of the deployed site: serves dist/ statically (like Vercel),
 * loads it in headless Chrome, and reports console errors + whether the Expo app
 * actually mounts into #root.
 *
 * Also loads a variant page without the leftover dev-shell <script> tag to
 * isolate whether that tag (and its parse error) prevents mounting.
 *
 * Usage: node scripts/verify-dist.js [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2] || 4199);
const DIST = path.join(__dirname, '..', 'dist');
const TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.map': 'application/json', '.txt': 'text/plain',
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found — run `pnpm exec expo export --platform web` first.');
  process.exit(1);
}

// Test variant: same HTML minus the dev-shell script tag (which gets rewritten
// to index.html and parses as HTML -> "Unexpected token '<'").
const variantFile = path.join(DIST, '__test-nodevshell.html');
const originalHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
fs.writeFileSync(
  variantFile,
  originalHtml.replace(/<script src="\/index\.web\.bundle[^"]*"[^>]*><\/script>/i, '<!-- removed dev-shell tag -->')
);

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(DIST, p);
  if (!fs.existsSync(file)) {
    console.log(`  [server] SPA-rewrite ${p} -> index.html`);
    file = path.join(DIST, 'index.html');
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

function attachPageHooks(page, label) {
  const logs = [];
  page.on('console', (m) => logs.push(`[${label}][console.${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[${label}][pageerror] ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`[${label}][requestfailed] ${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[${label}][http ${r.status()}] ${r.url()}`); });
  return logs;
}

async function loadAndReport(browser, url, label) {
  const page = await browser.newPage();
  const logs = attachPageHooks(page, label);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 12000));

  const state = await page.evaluate(() => ({
    rootChildren: document.getElementById('root')?.children.length ?? -1,
    bodyText: (document.body.innerText || '').slice(0, 200),
    lastRenderState: window.__APP_LAST_RENDER_STATE__,
    moduleLoadedAt: window.__APP_MODULE_LOADED_AT__,
    mountedFlag: window.__EXPO_APP_MOUNTED__,
    hasRootNavigator: typeof window.RootNavigator,
    hasApp: typeof window.App,
    scriptCount: document.querySelectorAll('script[src]').length,
  }));

  console.log(`\n=== ${label}: ${url} ===`);
  console.log(JSON.stringify(state, null, 2));
  console.log(`--- ${label} console/network ---`);
  for (const l of logs) console.log(l);
  await page.close();
  return state.rootChildren > 0;
}

async function main() {
  await new Promise((r) => server.listen(PORT, r));
  console.log(`serving ${DIST} on http://localhost:${PORT}`);

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ channel: 'chrome', headless: 'new' });

  const mountedWithoutDevShell = await loadAndReport(browser, `http://localhost:${PORT}/__test-nodevshell.html`, 'CLEAN');
  const mountedAsDeployed = await loadAndReport(browser, `http://localhost:${PORT}/`, 'AS-DEPLOYED');

  await browser.close();
  server.close();
  fs.rmSync(variantFile, { force: true });

  console.log(`\n=== SUMMARY ===`);
  console.log(`CLEAN variant mounts: ${mountedWithoutDevShell}`);
  console.log(`AS-DEPLOYED mounts:   ${mountedAsDeployed}`);
  process.exit(mountedAsDeployed || mountedWithoutDevShell ? 0 : 2);
}

main().catch((e) => { console.error('VERIFY FAILED:', e.message); process.exit(1); });
