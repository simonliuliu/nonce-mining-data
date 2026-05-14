// components/PageLoader.jsx
// 骨架屏加载组件 — 使用固定像素宽度，确保在任何容器中都正确显示

export default function PageLoader({ lines = 6, showHeader = true }) {
  return (
    <div style={{ paddingTop: 4, width: "100%" }}>

      {/* 标题骨架 */}
      {showHeader && (
        <div style={{ marginBottom: 28 }}>
          <Bone w={280} h={28} mb={12} />
          <Bone w={480} h={14} mb={6} />
          <Bone w={360} h={14} />
        </div>
      )}

      {/* Metric cards 骨架 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 28,
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}>
            <Bone w={100} h={10} mb={12} />
            <Bone w={80}  h={28} mb={8} />
            <Bone w={120} h={10} />
          </div>
        ))}
      </div>

      {/* 表格骨架 */}
      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
      }}>
        {/* 表头 */}
        <div style={{
          background: "var(--bg-inset)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}>
          <Bone w={20}  h={10} />
          <Bone w={140} h={10} />
          <Bone w={80}  h={10} />
          <Bone w={50}  h={10} />
          <Bone w={50}  h={10} />
          <Bone w={80}  h={10} />
          <Bone w={80}  h={10} />
        </div>

        {/* 表格行 */}
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{
            padding: "12px 20px",
            borderBottom: i < lines - 1 ? "1px solid var(--border)" : "none",
            display: "flex",
            gap: 20,
            alignItems: "center",
            opacity: 1 - i * 0.08,
          }}>
            <Bone w={20}  h={12} />
            <Bone w={140} h={12} />
            <Bone w={80}  h={12} />
            <Bone w={50}  h={12} />
            <Bone w={50}  h={12} />
            <Bone w={80}  h={12} />
            <Bone w={80}  h={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 单个骨架元素
function Bone({ w, h, mb = 0 }) {
  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: 4,
      marginBottom: mb,
      flexShrink: 0,
      background: "linear-gradient(90deg, var(--bg3) 25%, rgba(255,255,255,0.05) 50%, var(--bg3) 75%)",
      backgroundSize: "400px 100%",
      animation: "shimmer 1.6s ease-in-out infinite",
    }} />
  );
}
