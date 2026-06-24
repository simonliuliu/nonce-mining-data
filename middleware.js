// middleware.js
//
// This site (Hash Research, thehashresearch.com) has been superseded by the
// company site at https://nonce.app, which serves the same content under
// sub-paths (/<locale>/insights/... for data, /<locale>/research/... for
// articles). To consolidate SEO/GEO signal onto nonce.app, EVERY request here
// is permanently (301) redirected to the matching nonce.app URL.
//
// We redirect (rather than just Disallow in robots.txt) so crawlers that fetch
// an old URL immediately see the 301 and transfer ranking to the new URL.
import { NextResponse } from "next/server";

const NEW_ORIGIN = "https://nonce.app";
const LOCALES = ["en", "zh"];
const DEFAULT_LOCALE = "en";

// Article slugs that exist on nonce.app (/<locale>/research/<slug>). An old
// article whose slug isn't here is sent to the /research index instead of a
// dead deep link.
const KNOWN_ARTICLE_SLUGS = new Set([
  "ai-mining-management-vs-human-monitoring",
  "asic-batch-overclock-underclock-roi",
  "bitcoin-hashrate-monitoring",
  "bitcoin-miners-ai-data-centers",
  "bitcoin-mining-guide-2026",
  "bitcoin-mining-management-platforms-2026",
  "btc-tools-alternatives-nonce",
  "cost-to-mine-one-bitcoin-2026",
  "migrate-foreman-obm-to-nonce",
]);

// Map the old path (after the locale segment) to the new path on nonce.app.
// `seg` is the segment array, e.g. ["company", "MARA"] or ["rankings", "holdings"].
function mapToNewPath(seg) {
  if (seg.length === 0) return "insights"; // /<locale> -> data landing
  const [head, ...rest] = seg;
  switch (head) {
    case "articles": {
      const slug = rest[0];
      if (!slug) return "research";
      return KNOWN_ARTICLE_SLUGS.has(slug) ? `research/${slug}` : "research";
    }
    case "company":
      // old singular /company/<TICKER> -> plural, lower-cased, under /insights
      return rest[0] ? `insights/companies/${rest.join("/").toLowerCase()}` : "insights";
    case "compare":
      return rest.length ? `insights/compare/${rest.join("/")}` : "insights/compare";
    case "faq":
      return "insights/faq";
    case "methodology":
      return "insights/methodology";
    case "rankings": {
      // old metric "holdings" was renamed to "treasury" on the new site
      const raw = rest[0];
      const metric = raw === "holdings" ? "treasury" : raw;
      return metric ? `insights/rankings/${metric}` : "insights/rankings/production";
    }
    default:
      return "insights"; // anything unrecognised -> data landing
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Don't touch internal assets / API; files (with a dot) are excluded by the
  // matcher too, so robots.txt & sitemap.xml keep serving (lets crawlers read
  // them, crawl old URLs, and follow the 301s).
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  let locale;
  let rest;
  if (segments.length && LOCALES.includes(segments[0])) {
    locale = segments[0];
    rest = segments.slice(1);
  } else {
    // no locale prefix -> pick from Accept-Language, keep the whole path
    const acceptLang = request.headers.get("accept-language") || "";
    const pref = acceptLang.split(",")[0]?.trim()?.slice(0, 2)?.toLowerCase();
    locale = LOCALES.includes(pref) ? pref : DEFAULT_LOCALE;
    rest = segments;
  }

  const newPath = mapToNewPath(rest);
  const target = `${NEW_ORIGIN}/${locale}/${newPath}`.replace(/\/+$/, "");

  return NextResponse.redirect(target, 301); // permanent
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*$).*)"],
};
