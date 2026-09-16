// Report export helpers — web-first.
// PNG/PDF capture uses html2canvas + jsPDF (loaded from CDN on demand, so they
// add zero weight until an export actually happens). On native we can't capture
// the DOM, so PNG/PDF fall back to CSV of the same data.

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('web only'));
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.dataset.loaded === 'true') return resolve();
    const el = existing || document.createElement('script');
    el.src = src;
    el.onload = () => { el.dataset.loaded = 'true'; resolve(); };
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    if (!existing) document.head.appendChild(el);
  });

const ensureLibs = async () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('web only');
  if (!window.html2canvas) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
};

const safeName = (name) => String(name || 'report').replace(/[^a-z0-9_-]+/gi, '_');

const triggerDownload = (href, filename) => {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** Capture a React ref's DOM node as a PNG download. */
export const exportRefAsPng = async (ref, filename) => {
  if (typeof window === 'undefined') return { ok: false, error: new Error('PNG export is available on web.') };
  try {
    const node = ref?.current;
    if (!node) throw new Error('Nothing to capture');
    await ensureLibs();
    const canvas = await window.html2canvas(node, { backgroundColor: '#17082e', scale: 2 });
    triggerDownload(canvas.toDataURL('image/png'), `${safeName(filename)}.png`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
};

/** Capture a React ref's DOM node as a multi-page-safe PDF download. */
export const exportRefAsPdf = async (ref, filename, title = 'Report') => {
  if (typeof window === 'undefined') return { ok: false, error: new Error('PDF export is available on web.') };
  try {
    const node = ref?.current;
    if (!node) throw new Error('Nothing to capture');
    await ensureLibs();
    const canvas = await window.html2canvas(node, { backgroundColor: '#17082e', scale: 2 });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 40;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.setFontSize(14);
    pdf.text(title, 20, 30);
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 20, 45, imgW, imgH);
    let remaining = imgH;
    let y = 45;
    while (remaining > pageH - 60) {
      remaining -= pageH - 60;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 20, 15 - (imgH - remaining), imgW, imgH);
    }
    pdf.save(`${safeName(filename)}.pdf`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
};

/** Download a CSV string (web) / share-friendly fallback text (native). */
export const exportCsv = (rows, filename) => {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${safeName(filename)}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { ok: true };
  }
  return { ok: false, error: new Error('CSV export is available on web.') };
};

/** Copy text to clipboard (web). */
export const copyToClipboard = async (text) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    }
  } catch (e) { /* fallthrough */ }
  return { ok: false, error: new Error('Copy not available') };
};
