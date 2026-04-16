// lib/seo.js
// Shared SEO utilities: metadata builders, JSON-LD schema generators, canonical helpers

const SITE_URL  = "https://data.nonce.app"; // ← update to your actual domain
const SITE_NAME = "Nonce Mining Data";
const SITE_DESC = "Track the financial and operational performance of every major public Bitcoin mining company. BTC production, hashrate, costs, revenue — sourced from SEC filings.";
const OG_IMAGE  = `${SITE_URL}/og-default.png`; // add a default OG image to /public/

// ─── Canonical URL builder ────────────────────────────────────────────────────

export function canonicalUrl(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ─── Base metadata builder ────────────────────────────────────────────────────
// Use in every page's generateMetadata()

export function buildMetadata({
  title,
  description,
  path = "",
  ogImage = OG_IMAGE,
  noIndex = false,
}) {
  const url = canonicalUrl(path);
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;

  return {
    title: fullTitle,
    description: description || SITE_DESC,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: description || SITE_DESC,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || SITE_DESC,
      images: [ogImage],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

// ─── WebSite + Organization schema (homepage only) ───────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESC,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/rankings/production?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        sameAs: ["https://nonce.app/"],
      },
    ],
  };
}

// ─── BreadcrumbList schema ────────────────────────────────────────────────────

export function breadcrumbSchema(items) {
  // items: [{ name, url }, ...]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.url),
    })),
  };
}

// ─── FAQPage schema ───────────────────────────────────────────────────────────

export function faqPageSchema(faqs) {
  // faqs: [{ question: string, answer: string }, ...]
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

// ─── Article schema ───────────────────────────────────────────────────────────

export function articleSchema({ title, description, url, publishDate, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonicalUrl(url),
    datePublished: publishDate,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(image && { image }),
  };
}

// ─── Dataset schema (for data pages) ─────────────────────────────────────────

export function datasetSchema({ name, description, url, keywords = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: canonicalUrl(url),
    keywords,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
  };
}

// ─── JSON-LD inline component helper ─────────────────────────────────────────
// Usage in page.js: <JsonLd data={websiteSchema()} />

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

export { SITE_URL, SITE_NAME };
