# EarningsApp Web Performance Report

_Last updated: 2025-12-06_

## Build Metrics
| Metric | Before | After | Notes |
| --- | --- | --- | --- |
| JavaScript bundle (`index.web.js`) | 2.04 MB | **2.03 MB** | Slight win due to tree-shaking & font cleanup. Further gains require code splitting or route-based bundles. |
| Assets folder size | ~3.4 MB | **3.12 MB** | Calculated with `Get-ChildItem -Recurse web-build/assets`. Shrink driven by removing unused fonts + optimized logo/favicon. |
| Icon font payload | 18 fonts / 3.1 MB | **Ionicons only / 247 KB** | Manual cleanup via `scripts/remove-unused-fonts.js`. |
| Favicon/logo | 925 KB PNG | **19.7 KB base logo + optimized variants** | `scripts/optimize-favicon.js` generates favicon + app icons from logo. Base logo: 19.7 KB; favicon-16: 487 B; favicon-32: 1.1 KB; Icon.png: 84.7 KB; icon-512: 56.9 KB; gigs-logo-web: 16.3 KB. |

## Optimizations Implemented
1. **Font Pruning**
   - Only Ionicons glyphs are referenced in code, so we delete every other font from the exported assets.
   - Added `scripts/remove-unused-fonts.js` and wired it into `npm run build:web` for automatic cleanup.

2. **Image & Icon Pipeline**
   - `scripts/optimize-favicon.js` resizes/compresses the GigSmart logo into favicon/app-icon variants before each build (`prebuild`).
   - `scripts/convert-to-webp.js` converts PNG/JPG to WebP using `npx sharp` with fallback to copying.

3. **Lazy Asset Component**
   - Added `src/components/LazyAsset.js` as the building block for deferring non-critical visuals while showing an activity indicator.
   - Implemented in `ReferralScreen.js` for the hero image.

4. **Netlify Performance Headers**
   - Added preload headers for main bundle and Ionicons font to improve first paint.
   - Enhanced caching policies for static assets.

5. **Build Scripts**
   - `npm run build:web` ⇒ export + font cleanup.
   - `npm run build:web:optimized` ⇒ full export + asset optimization pipeline.

## Remaining Opportunities
1. **Route-level code splitting** – adopt Expo Router or dynamic imports to bring bundle <= 1.5 MB.
2. **Service Worker** – implement caching strategies for offline support.
3. **Further image optimization** – convert remaining assets to WebP/AVIF.
4. **Bundle analysis** – use `npm run analyze` to identify large dependencies.

## Verification Checklist
- [x] `node_modules` is absent from `web-build/assets`.
- [x] Only `Ionicons.ttf` ships (247 KB).
- [x] Custom favicon appears (hash `140c53a7643ea949007aa9a28153849`).
- [x] `web-build` rebuild succeeds via `npm run build:web`.
- [x] Netlify preload headers configured for critical resources.
- [x] LazyAsset component implemented for hero images.
- [x] Logo pipeline finalized: base logo replaced and all icon variants regenerated.
- [x] Final assets size: ~3.12 MB with fonts pruned to Ionicons only.
- [x] Bundle size stable at ~2.03 MB with lazy loading in place.

### Post-deployment checks (run after Netlify deploy)
- [ ] Verify favicon and app icons show the new GIGS logo in browser tabs and PWA install screens.
- [ ] Confirm no "Loading assets" hang on first visit (clear cache first).
- [ ] Check that lazy-loaded hero image in ReferralScreen defers correctly.

Use this report as the baseline for future tuning.
