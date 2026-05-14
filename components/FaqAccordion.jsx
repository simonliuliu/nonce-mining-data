"use client";
import { useState } from "react";

function FaqItem({ question, answer_html, locale }) {
  const [open, setOpen] = useState(false);

  const noAnswer = !answer_html || answer_html.trim() === "";

  return (
    <div style={{
      background: "var(--bg2)",
      border: `1px solid ${open ? "var(--border2)" : "var(--border)"}`,
      borderRadius: 10,
      transition: "border-color 0.15s",
      overflow: "visible",
    }}>
      {/* Header — always clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          padding: "13px 16px",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text)",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          fontFamily: "inherit",
          gap: 12,
        }}
      >
        <span style={{ flex: 1, lineHeight: 1.5 }}>{question}</span>
        {/* Animated +/− icon */}
        <span style={{
          color: open ? "var(--brand)" : "var(--text3)",
          fontSize: 18,
          lineHeight: 1,
          flexShrink: 0,
          fontWeight: 300,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s, color 0.15s",
          display: "inline-block",
        }}>
          +
        </span>
      </button>

      {/* Answer body */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {noAnswer ? (
            <p style={{
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--text3)",
              margin: 0,
              fontStyle: "italic",
            }}>
              {locale === "zh" ? "答案正在整理中，敬请期待。" : "Answer coming soon."}
            </p>
          ) : (
            <div
              className="prose"
              style={{ padding: "12px 16px 14px", fontSize: 14 }}
              dangerouslySetInnerHTML={{ __html: answer_html }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion({ faqs, locale }) {
  if (!faqs?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {faqs.map(faq => (
        <FaqItem
          key={faq.id}
          question={faq.question}
          answer_html={faq.answer_html}
          locale={locale}
        />
      ))}
    </div>
  );
}
