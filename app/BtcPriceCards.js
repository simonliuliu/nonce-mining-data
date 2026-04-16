"use client";

import { useState, useEffect } from "react";

export default function BtcPriceCards({ avgCashCost }) {
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    async function fetchPrice() {
      // Try CoinGecko first, then Coinbase
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        if (res.ok) {
          const j = await res.json();
          if (j?.bitcoin?.usd) { setBtcPrice(Math.round(j.bitcoin.usd)); return; }
        }
      } catch(e) {}
      try {
        const res = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
        if (res.ok) {
          const j = await res.json();
          if (j?.data?.amount) { setBtcPrice(Math.round(parseFloat(j.data.amount))); return; }
        }
      } catch(e) {}
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const costVsPrice = (avgCashCost && btcPrice)
    ? ((btcPrice - avgCashCost) / avgCashCost) * 100
    : null;

  return (
    <>
      <div className="metric-card">
        <div className="metric-label">Avg cash cost</div>
        <div className="metric-value">{avgCashCost ? `$${Math.round(avgCashCost / 1000)}K` : "—"}</div>
        <div className="metric-sub">Per BTC mined</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">BTC spot price</div>
        <div className="metric-value">{btcPrice ? `$${Math.round(btcPrice / 1000)}K` : "..."}</div>
        {costVsPrice != null && (
          <div className="metric-sub" style={{ color: costVsPrice >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
            {costVsPrice >= 0
              ? `${Math.abs(costVsPrice).toFixed(0)}% above cost`
              : `${Math.abs(costVsPrice).toFixed(0)}% below cost`}
          </div>
        )}
      </div>
    </>
  );
}
