/**
 * Microsoft Graph Planner `references` keys must follow the shape shown in Graph docs
 * (e.g. Update plannerTaskDetails), NOT full `encodeURIComponent(url)`:
 *
 *   https%3A//contoso%2Esharepoint%2Ecom/sites/a/file%2Epng
 *
 * Only `. : % @ #` (OData open-type name rules) and spaces are escaped; `/` stays literal.
 * Encoding `/` as `%2F` makes OData treat the key as invalid ("unexpected instance annotation").
 *
 * @see https://learn.microsoft.com/en-us/graph/api/plannertaskdetails-update
 */

const ODATA_OPEN_NAME_SPECIAL = new Set(['.', ':', '%', '@', '#']);

function encodePlannerOpenTypeFragment(part: string): string {
  let out = '';
  for (const ch of part) {
    const code = ch.charCodeAt(0);
    if (code > 127) {
      out += encodeURIComponent(ch);
    } else if (ODATA_OPEN_NAME_SPECIAL.has(ch)) {
      out += encodeURIComponent(ch);
    } else if (ch === ' ') {
      out += '%20';
    } else {
      out += ch;
    }
  }
  return out;
}

function fullyDecodeUrlString(s: string): string {
  let t = s.trim();
  for (let i = 0; i < 8; i++) {
    try {
      const d = decodeURIComponent(t);
      if (d === t) break;
      t = d;
    } catch {
      break;
    }
  }
  return t;
}

/** Decode all levels of %xx in a path/query/hash fragment (handles %2520 → space). */
function fullyDecodeComponent(s: string): string {
  let t = s;
  for (let i = 0; i < 8; i++) {
    try {
      const d = decodeURIComponent(t);
      if (d === t) break;
      t = d;
    } catch {
      break;
    }
  }
  return t;
}

export function plannerReferenceKeyFromUrl(url: string): string {
  let s = fullyDecodeUrlString(url);
  if (!s) return '';
  const normalized = /^https?:\/\//i.test(s) ? s : `https://${s}`;

  let u: URL;
  try {
    u = new URL(normalized);
  } catch {
    return encodeURIComponent(normalized);
  }

  const scheme = u.protocol === 'https:' ? 'https' : 'http';
  const host = u.hostname.replace(/\./g, '%2E');
  let authority = host;
  if (u.port) {
    authority += `%3A${u.port}`;
  }

  // pathname/search/hash from URL() often keep percent-encoding (e.g. %20). If we OData-encode
  // again, "%" becomes "%25" → %2520. Decode each segment first, then apply Graph's key rules.
  let path = '';
  if (u.pathname && u.pathname !== '/') {
    const segments = u.pathname.split('/').map((seg) =>
      seg === '' ? '' : encodePlannerOpenTypeFragment(fullyDecodeComponent(seg)),
    );
    path = segments.join('/');
  }

  let key = `${scheme}%3A//${authority}${path}`;

  if (u.search) {
    key += encodePlannerOpenTypeFragment(fullyDecodeComponent(u.search));
  }
  if (u.hash) {
    key += encodePlannerOpenTypeFragment(fullyDecodeComponent(u.hash));
  }

  return key;
}

/** Turn a Graph `references` map key back into a normal https URL for display and editing. */
export function plannerReferenceKeyToDisplayUrl(key: string): string {
  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  const m = /^(https?)%3A\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i.exec(key);
  if (!m) {
    let s = key;
    for (let i = 0; i < 8; i++) {
      try {
        const d = decodeURIComponent(s);
        if (d === s) break;
        s = d;
      } catch {
        break;
      }
    }
    return s;
  }

  const scheme = m[1];
  const hostAuth = m[2].replace(/%2E/gi, '.').replace(/%3A/gi, ':');
  const decodePathLike = (p: string) =>
    p.replace(/%2E/gi, '.').replace(/%20/g, ' ');

  const pathPart = decodePathLike(m[3] || '');
  const queryPart = decodePathLike(m[4] || '');
  let hashPart = m[5] || '';
  if (hashPart) {
    hashPart = hashPart.replace(/^%23/, '#');
    hashPart = decodePathLike(hashPart);
  }

  return `${scheme}://${hostAuth}${pathPart}${queryPart}${hashPart}`;
}
