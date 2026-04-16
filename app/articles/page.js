// app/articles/page.js — Server Component (no event handlers here)
import { getPublishedArticles } from "@/lib/notion";
import Link from "next/link";
import ArticleGrid from "./ArticleGrid";  // ← client component handles hover

export const revalidate = 3600;
export const metadata = {
  title: "Research & Analysis — Nonce Mining Data",
  description: "In-depth analysis and reports on Bitcoin mining companies and the mining industry.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <Link href="/" style={{ fontSize: 13, color: "var(--text2)" }}>← Home</Link>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "16px 0 4px" }}>Research & Analysis</h1>
      <p className="section-sub" style={{ marginBottom: 28 }}>
        In-depth reports, company analysis, and mining industry research
      </p>
      <ArticleGrid articles={articles} />
    </>
  );
}
