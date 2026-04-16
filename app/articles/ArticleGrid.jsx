"use client";
import Link from "next/link";
import { useState } from "react";

const CATEGORY_COLORS = {
  "Company Analysis": "#F7931A",
  "Industry Report":  "#00D4AA",
  "Guide":            "#6C8EFF",
  "Data Update":      "#FF6B9D",
};
const PLACEHOLDER_BG = {
  "Company Analysis": "linear-gradient(135deg, #1a1200, #2a1f00)",
  "Industry Report":  "linear-gradient(135deg, #001a16, #002a22)",
  "Guide":            "linear-gradient(135deg, #0a0f1a, #0f1a2a)",
  "Data Update":      "linear-gradient(135deg, #1a001a, #2a0022)",
};
const DEFAULT_BG = "linear-gradient(135deg, #0d1117, #161b24)";

function accentOf(cat) { return CATEGORY_COLORS[cat] || "#F7931A"; }
function bgOf(cat, img) {
  if (img) return `url(${img}) center/cover no-repeat`;
  return PLACEHOLDER_BG[cat] || DEFAULT_BG;
}

// ── Hoverable card wrapper ──────────────────────────────────────────────────

function HoverCard({ accent, children, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        border: `1px solid ${hovered ? accent : "var(--border)"}`,
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "border-color 0.2s, transform 0.15s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Large featured card ─────────────────────────────────────────────────────

function FeaturedCard({ a }) {
  const accent = accentOf(a.category);
  return (
    <Link href={`/articles/${a.slug}`} style={{ display: "block", textDecoration: "none" }}>
      <HoverCard accent={accent} style={{ borderRadius: 12 }}>
        <div style={{ height: 220, background: bgOf(a.category, a.cover_image), position: "relative" }}>
          {!a.cover_image && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.1 }}>₿</div>
          )}
        </div>
        <div style={{ padding: "18px 20px 20px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            {a.category && <CategoryBadge label={a.category} accent={accent} />}
            {a.related_company && <span style={{ fontSize: 11, color: "var(--text3)" }}>{a.related_company}</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{a.title}</div>
          {a.meta_description && (
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>{a.meta_description}</div>
          )}
          <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.publish_date || "Draft"}</div>
        </div>
      </HoverCard>
    </Link>
  );
}

// ── Standard grid card ──────────────────────────────────────────────────────

function ArticleCard({ a }) {
  const accent = accentOf(a.category);
  return (
    <Link href={`/articles/${a.slug}`} style={{ display: "block", textDecoration: "none", height: "100%" }}>
      <HoverCard accent={accent} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 130, background: bgOf(a.category, a.cover_image), flexShrink: 0, position: "relative" }}>
          {!a.cover_image && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.1 }}>₿</div>
          )}
        </div>
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
          {a.category && (
            <div style={{ marginBottom: 8 }}>
              <CategoryBadge label={a.category} accent={accent} small />
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45, marginBottom: 6, flex: 1 }}>{a.title}</div>
          {a.meta_description && (
            <div style={{
              fontSize: 12, color: "var(--text2)", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden", marginBottom: 10,
            }}>
              {a.meta_description}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: "auto" }}>{a.publish_date || "Draft"}</div>
        </div>
      </HoverCard>
    </Link>
  );
}

function CategoryBadge({ label, accent, small }) {
  return (
    <span style={{
      fontSize: small ? 10 : 11, fontWeight: 600, color: accent,
      background: accent + "18", padding: small ? "2px 6px" : "2px 8px",
      borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{label}</span>
  );
}

// ── Main grid ───────────────────────────────────────────────────────────────

export default function ArticleGrid({ articles }) {
  if (!articles.length) {
    return (
      <div className="text-block" style={{ textAlign: "center", padding: 48 }}>
        <p style={{ fontSize: 16, marginBottom: 8 }}>No published articles yet</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          In Notion, set Status to "Published" and add a Slug to make articles appear here.
        </p>
      </div>
    );
  }

  const featured = articles.filter(a => a.featured);
  const rest = articles.filter(a => !a.featured);
  const gridItems = featured.length ? rest : articles;

  return (
    <>
      {featured.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Featured</SectionLabel>
          <FeaturedCard a={featured[0]} />
        </div>
      )}

      {gridItems.length > 0 && (
        <>
          {featured.length > 0 && <SectionLabel>All Articles</SectionLabel>}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {gridItems.map(a => <ArticleCard key={a.slug} a={a} />)}
          </div>
        </>
      )}
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: "var(--text3)",
      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
    }}>{children}</div>
  );
}
