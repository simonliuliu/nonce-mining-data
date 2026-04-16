import { getArticleBySlug, blocksToHtml } from "@/lib/notion";
import Link from "next/link";
import { notFound } from "next/navigation";
export const revalidate = 3600;
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Not Found" };
  return { title: `${a.title} — Nonce Mining Data`, description: a.meta_description || a.title };
}
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) notFound();
  const html = blocksToHtml(a.blocks || []);
  return <>
    <Link href="/articles" style={{ fontSize: 13, color: "var(--text2)" }}>← All articles</Link>
    <article style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {a.category && <span className="tag">{a.category}</span>}
        {a.related_company && <span className="tag">{a.related_company}</span>}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{a.title}</h1>
      <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>{a.publish_date}</div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {a.cta_type === "Nonce App" && (
        <div className="cta-banner"><h3>Explore mining data in real-time</h3><p>Nonce.app gives you live tracking and analysis tools</p><a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Try Nonce.app →</a></div>
      )}
    </article>
  </>;
}
