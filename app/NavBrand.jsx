"use client";
import Link from "next/link";
import { useState } from "react";

export default function NavBrand({ locale = "en" }) {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <Link href={`/${locale}`} className="nav-brand">
      {logoOk ? (
        <img src="/logo.jpg" alt="" className="nav-logo" onError={() => setLogoOk(false)} />
      ) : (
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#F7931A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0, letterSpacing: "-0.03em" }}>
          HR
        </div>
      )}
      <span className="nav-brand-name">Hash Research</span>
    </Link>
  );
}
