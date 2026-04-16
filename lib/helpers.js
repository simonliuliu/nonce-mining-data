const COMPANIES = ["Marathon Digital","CleanSpark","Bitdeer","Cango"];
const TICKERS = {"Marathon Digital":"MARA",CleanSpark:"CLSK",Bitdeer:"BTDR",Cango:"CANG"};
const COLORS = {"Marathon Digital":"#F7931A",CleanSpark:"#00D4AA",Bitdeer:"#6C8EFF",Cango:"#FF6B9D"};
const PALETTE = ["#F7931A","#00D4AA","#6C8EFF","#FF6B9D","#A78BFA","#F472B6","#34D399","#FBBF24","#60A5FA","#FB923C","#C084FC","#4ADE80","#F87171","#38BDF8","#E879F9","#FCD34D","#818CF8","#2DD4BF","#FB7185","#A3E635"];

function getQuarters(d) { return [...new Set(d.map(r=>r.quarter))].filter(Boolean).sort(); }
function getYears(d) { return [...new Set(d.map(r=>r.quarter?.slice(0,4)))].filter(Boolean).sort(); }
function find(d,c,q) { return d.find(r=>r.company===c&&r.quarter===q); }

function calcChange(data,company,quarter,field,back) {
  const qs=getQuarters(data); const i=qs.indexOf(quarter);
  if(i<back) return null;
  const c=find(data,company,quarter), p=find(data,company,qs[i-back]);
  if(!c||!p||c[field]==null||p[field]==null||p[field]===0) return null;
  return ((c[field]-p[field])/Math.abs(p[field]))*100;
}

function enrichRows(data,quarter) {
  return COMPANIES.map(c => {
    const r = find(data,c,quarter) || {};
    let sd = r.report_period||"";
    const di = sd.lastIndexOf("-"); if(di>-1) sd=sd.slice(di+1).trim();
    return { company:c, ticker:TICKERS[c], ...r,
      qoqProd:calcChange(data,c,quarter,"btc_production",1),
      momProd:calcChange(data,c,quarter,"btc_production",2),
      yoyProd:calcChange(data,c,quarter,"btc_production",4),
      qoqHash:calcChange(data,c,quarter,"hashrate_ehs",1),
      qoqHold:calcChange(data,c,quarter,"btc_holdings",1),
      sourceDate:sd };
  }).sort((a,b)=>(b.btc_production||0)-(a.btc_production||0));
}

function buildAnnualData(data) {
  const years=getYears(data), result=[];
  for(const y of years) for(const c of COMPANIES) {
    const qs=data.filter(r=>r.company===c&&r.quarter?.startsWith(y));
    if(!qs.length) continue;
    const last=qs.sort((a,b)=>a.quarter.localeCompare(b.quarter)).slice(-1)[0];
    const sum=(f)=>{const v=qs.map(r=>r[f]).filter(x=>x!=null);return v.length?v.reduce((s,x)=>s+x,0):null;};
    result.push({company:c,ticker:TICKERS[c],quarter:y,
      btc_production:sum("btc_production"),btc_holdings:last.btc_holdings,
      hashrate_ehs:last.hashrate_ehs,total_revenue_100m:sum("total_revenue_100m"),
      mining_revenue_100m:sum("mining_revenue_100m"),gross_profit_100m:sum("gross_profit_100m"),
      net_income_100m:sum("net_income_100m"),cash_cost_per_btc:last.cash_cost_per_btc,
      power_capacity_mw:last.power_capacity_mw,miner_count:last.miner_count,
      efficiency_jth:last.efficiency_jth,miner_model:last.miner_model,
      electricity_price:last.electricity_price,
      source_url:last.source_url,report_period:last.report_period,data_status:last.data_status});
  }
  return result;
}

// Ranking sort configs
const RANKING_CONFIG = {
  production: { field:"btc_production", label:"BTC Production", unit:"BTC", desc:true },
  hashrate:   { field:"hashrate_ehs", label:"Hashrate", unit:"EH/s", desc:true },
  holdings:   { field:"btc_holdings", label:"BTC Holdings", unit:"BTC", desc:true },
  cost:       { field:"cash_cost_per_btc", label:"Cash Cost per BTC", unit:"$", desc:false },
  revenue:    { field:"total_revenue_100m", label:"Revenue", unit:"$100M", desc:true },
  efficiency: { field:"efficiency_jth", label:"Fleet Efficiency", unit:"J/TH", desc:false },
};

function buildCompanyTimeseries(data,company) {
  return data.filter(r=>r.company===company).sort((a,b)=>a.quarter.localeCompare(b.quarter)).map(r=>({
    quarter:r.quarter, production:r.btc_production, holdings:r.btc_holdings,
    hashrate:r.hashrate_ehs,
    revenue:r.total_revenue_100m?+(r.total_revenue_100m*100).toFixed(1):null,
    mining_revenue:r.mining_revenue_100m?+(r.mining_revenue_100m*100).toFixed(1):null,
    gross_profit:r.gross_profit_100m?+(r.gross_profit_100m*100).toFixed(1):null,
    net_income:r.net_income_100m?+(r.net_income_100m*100).toFixed(1):null,
    cash_cost:r.cash_cost_per_btc, all_in_cost:r.all_in_cost_per_btc,
    power_mw:r.power_capacity_mw, miner_count:r.miner_count, efficiency:r.efficiency_jth,
    gross_margin:r.gross_profit_100m&&r.total_revenue_100m?+((r.gross_profit_100m/r.total_revenue_100m)*100).toFixed(1):null,
    net_margin:r.net_income_100m&&r.total_revenue_100m?+((r.net_income_100m/r.total_revenue_100m)*100).toFixed(1):null,
  }));
}

function fmt(v){return v==null?"—":typeof v==="number"?v.toLocaleString():v;}
function fmtM(v){return v==null?"—":`$${(v*100).toFixed(1)}M`;}

module.exports = {
  COMPANIES,TICKERS,COLORS,PALETTE,RANKING_CONFIG,
  getQuarters,getYears,find,calcChange,enrichRows,
  buildAnnualData,buildCompanyTimeseries,fmt,fmtM,
};
