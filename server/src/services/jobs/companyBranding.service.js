import { assertSafeRemoteHost } from '../../utils/jobValidation.js';

const decode = (text) => String(text || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\\\//g, '/');
const attribute = (tag, name) => decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1]);
const safeImage = (value, base) => {
  if (!value) return '';
  try { const url = new URL(decode(value), base); return url.protocol === 'https:' && !/(?:lever-logo|smartrecruiters.com\/sr-logo|greenhouse-logo|teamtailor-logo|workable-logo)/i.test(url.href) ? url.href : ''; } catch { return ''; }
};

// Only explicit employer branding, never a guessed domain/favicon or stock image.
export function extractCompanyLogo(html, pageUrl) {
  const decoded = decode(html);
  const square = decoded.match(/"logoSquareImageUrl"\s*:\s*"([^"\s]+)"/);
  if (square) return safeImage(square[1], pageUrl);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (/logo|logotype/i.test(tag) && !/footer|powered|lever logo|greenhouse logo|teamtailor logo|workable logo/i.test(tag)) {
      const url = safeImage(attribute(tag, 'src'), pageUrl);
      if (url) return url;
    }
  }
  const recruitee = decoded.match(/"logo"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/);
  if (recruitee) return safeImage(recruitee[1], pageUrl);
  // Workable publishes its employer logo explicitly as the board social image.
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]; const url = attribute(tag, 'content');
    if (attribute(tag, 'property') === 'og:image' && /workablehr\.s3\.amazonaws\.com\/uploads\/account\/open_graph_logo\//.test(url)) return safeImage(url, pageUrl);
  }
  return '';
}

export async function readPublicBranding(url, { fetchImpl = globalThis.fetch, validateRemoteHost = true } = {}) {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    if (validateRemoteHost) await assertSafeRemoteHost(current);
    const response = await fetchImpl(current, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'asif.to-jobs-importer/1.0', Accept: 'text/html' } });
    if ([301,302,303,307,308].includes(response.status)) { current = new URL(response.headers.get('location'), current).href; continue; }
    if (!response.ok) throw new Error(`Career branding returned HTTP ${response.status}`);
    return { logo: extractCompanyLogo(await response.text(), current), evidenceUrl: current };
  }
  throw new Error('Career branding exceeded redirect limit');
}
