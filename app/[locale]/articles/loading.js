export default function Loading() {
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={bone("25%", 26, { marginBottom: 10 })} />
      <div style={bone("50%", 14, { marginBottom: 28 })} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", opacity: 1 - (i-1)*0.08 }}>
            <div style={bone("100%", 130)} />
            <div style={{ padding: "14px 16px" }}>
              <div style={bone("80%", 13, { marginBottom: 8 })} />
              <div style={bone("95%", 11, { marginBottom: 4 })} />
              <div style={bone("70%", 11)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function bone(w, h, extra = {}) {
  return { width: w, height: h, borderRadius: 4, background: "linear-gradient(90deg, var(--bg3) 25%, rgba(255,255,255,0.04) 50%, var(--bg3) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite", flexShrink: 0, ...extra };
}
