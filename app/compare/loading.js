export default function Loading() {
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={bone("30%", 26, { marginBottom: 10 })} />
        <div style={bone("55%", 14)} />
      </div>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 600 }}>
        <div style={bone("40%", 12, { marginBottom: 20 })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 16 }}>
          <div style={bone("100%", 44)} />
          <div style={bone(40, 44)} />
          <div style={bone("100%", 44)} />
        </div>
        <div style={bone("100%", 44)} />
      </div>
    </div>
  );
}
function bone(w, h, extra = {}) {
  return { width: w, height: h, borderRadius: 8, background: "linear-gradient(90deg, var(--bg3) 25%, rgba(255,255,255,0.04) 50%, var(--bg3) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite", ...extra };
}
