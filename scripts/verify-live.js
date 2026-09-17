/**
 * Loads the LIVE deployed site in headless Chrome and reports exactly what a
 * user sees: whether the Expo app mounts, every console error, and screenshots.
 *
 * Usage: node scripts/verify-live.js [baseUrl]
 */
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'https://gig-smart.vercel.app';

async function loadAndReport(browser, url, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); // phone-sized
  const logs = [];
  page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 15000));

  const state = await page.evaluate(() => ({
    url: location.href,
    rootChildren: document.getElementById('root')?.children.length ?? -1,
    splashStillVisible: !!document.getElementById('boot-splash'),
    splashComputed: (() => { const s = document.getElementById('boot-splash'); if (!s) return 'removed'; const o = getComputedStyle(s); return `opacity=${o.opacity} display=${o.display}`; })(),
    bodyText: (document.body.innerText || '').slice(0, 300),
    lastRenderState: window.__APP_LAST_RENDER_STATE__,
    isAppMode: window.__GIGS_IS_APP__,
    swController: navigator.serviceWorker?.controller?.scriptURL || null,
    // Layout sanity: app container must fill the viewport (no squished-at-top UI).
    layout: (() => {
      const first = document.getElementById('root')?.firstElementChild;
      const h = first ? first.getBoundingClientRect().height : 0;
      return { firstChildHeight: Math.round(h), viewportHeight: innerHeight, fillsViewport: h > innerHeight * 0.5 };
    })(),
  }));

  const shot = `live-${label}.png`;
  await page.screenshot({ path: shot });
  console.log(`\n=== ${label}: ${url} ===`);
  console.log(JSON.stringify(state, null, 2));
  console.log(`--- console/network ---`);
  for (const l of logs) console.log(l);
  console.log(`screenshot: ${shot}`);
  await page.close();
  return state;
}

async function main() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: 'new' });
  const home = await loadAndReport(browser, `${BASE}/`, 'home');
  const app = await loadAndReport(browser, `${BASE}/app`, 'app');
  await browser.close();
  console.log('\n=== SUMMARY ===');
  console.log(`home mounts:   ${home.rootChildren > 0} (splash: ${home.splashStillVisible}) layout ok: ${home.layout?.fillsViewport} (${home.layout?.firstChildHeight}px)`);
  console.log(`/app mounts:   ${app.rootChildren > 0} (splash: ${app.splashStillVisible}) layout ok: ${app.layout?.fillsViewport} (${app.layout?.firstChildHeight}px)`);
  process.exit(home.rootChildren > 0 && home.layout?.fillsViewport ? 0 : 2);
}

main().catch((e) => { console.error('VERIFY-LIVE FAILED:', e.message); process.exit(1); });
