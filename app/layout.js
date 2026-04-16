import "./globals.css";
import Link from "next/link";
import { JsonLd, websiteSchema, SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bitcoin Mining Company Analytics`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Track BTC production, hashrate, costs, and financials for every public Bitcoin mining company. Data sourced from SEC filings.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={websiteSchema()} />

        <nav className="nav">
          <div className="container">
            <div className="nav-inner">
              <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
                <span className="nav-brand-name">⛏ Nonce</span>
                <span className="nav-brand-sub">Mining Data</span>
              </Link>
              <a href="https://nonce.app/" target="_blank" rel="noopener" className="nav-cta">Try Nonce.app →</a>
            </div>
            <div className="nav-tabs">
              <Link href="/" className="nav-tab">Overview</Link>
              <Link href="/rankings/production" className="nav-tab">Rankings</Link>
              <Link href="/compare" className="nav-tab">Compare</Link>
              <Link href="/metrics/btc-production" className="nav-tab">Metrics</Link>
              <Link href="/articles" className="nav-tab">Research</Link>
              <Link href="/methodology" className="nav-tab">Methodology</Link>
              <Link href="/faq" className="nav-tab">FAQ</Link>
            </div>
          </div>
        </nav>

        <main className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
          {children}
        </main>

        <footer className="footer">
          <div className="container">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
              <Link href="/methodology">Methodology</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/metrics/btc-production">Metrics</Link>
              <Link href="/rankings/production">Rankings</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/articles">Research</Link>
              <a href="https://nonce.app/" target="_blank" rel="noopener">Nonce.app</a>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              Data sourced from SEC filings & quarterly reports. All figures are for informational purposes only.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
