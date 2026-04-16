"use client";
import { BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,ComposedChart,ReferenceLine } from "recharts";
const ax={fontSize:11,fill:"#8b949e"};
function Tip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return<div style={{background:"#0d1117",border:"1px solid #30363d",borderRadius:10,padding:"12px 16px",fontSize:12,boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>
    <div style={{fontWeight:600,marginBottom:8,color:"#e6edf3",fontSize:13}}>{label}</div>
    {payload.filter(p=>p.value!=null).map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
      <span style={{width:10,height:10,borderRadius:3,background:p.color||p.stroke,display:"inline-block",flexShrink:0}}/>
      <span style={{color:"#8b949e",minWidth:80}}>{p.name}</span>
      <span style={{color:"#e6edf3",fontFamily:"monospace",fontWeight:500}}>{typeof p.value==="number"?p.value.toLocaleString():p.value}</span>
    </div>)}
  </div>;
}
function W({title,children,height=300}){return<div className="chart-card"><div className="chart-title">{title}</div><ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer></div>}

export function CompanyProductionChart({data,color}){return<W title="BTC production & holdings" height={280}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis yAxisId="left" tick={ax}/><YAxis yAxisId="right" orientation="right" tick={ax}/><Tooltip content={<Tip/>} cursor={false}/><Legend wrapperStyle={{fontSize:12}}/><Bar yAxisId="left" dataKey="production" name="BTC mined" fill={color} radius={[3,3,0,0]} opacity={.8}/><Line yAxisId="right" type="monotone" dataKey="holdings" name="BTC held" stroke="#F7931A" strokeWidth={2} dot={{r:3}} connectNulls/></ComposedChart></W>}

export function CompanyHashrateChart({data,color}){return<W title="Hashrate & power capacity" height={260}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis yAxisId="left" tick={ax}/><YAxis yAxisId="right" orientation="right" tick={ax}/><Tooltip content={<Tip/>} cursor={false}/><Legend wrapperStyle={{fontSize:12}}/><Bar yAxisId="left" dataKey="hashrate" name="Hashrate (EH/s)" fill={color} radius={[3,3,0,0]} opacity={.7}/><Line yAxisId="right" type="monotone" dataKey="power_mw" name="Power (MW)" stroke="#FF6B9D" strokeWidth={2} dot={{r:3}} connectNulls/></ComposedChart></W>}

export function CompanyRevenueChart({data,color}){return<W title="Revenue vs net income ($M)" height={280}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis tick={ax}/><Tooltip content={<Tip/>} cursor={false}/><Legend wrapperStyle={{fontSize:12}}/><ReferenceLine y={0} stroke="#484f58" strokeWidth={.5}/><Bar dataKey="revenue" name="Revenue" fill={color} radius={[3,3,0,0]} opacity={.6}/><Line type="monotone" dataKey="net_income" name="Net income" stroke="#FF5252" strokeWidth={2} dot={{r:3}} connectNulls/></ComposedChart></W>}

export function CompanyMarginChart({data,color}){return<W title="Gross margin vs net margin (%)" height={240}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis tick={ax} tickFormatter={v=>`${v}%`}/><Tooltip content={<Tip/>}/><Legend wrapperStyle={{fontSize:12}}/><ReferenceLine y={0} stroke="#484f58" strokeWidth={.5}/><Line type="monotone" dataKey="gross_margin" name="Gross margin %" stroke={color} strokeWidth={2} dot={{r:3}} connectNulls/><Line type="monotone" dataKey="net_margin" name="Net margin %" stroke="#FF5252" strokeWidth={2} dot={{r:3}} strokeDasharray="5 5" connectNulls/></LineChart></W>}

export function CompanyCostChart({data,color}){return<W title="Cash cost vs all-in cost per BTC ($)" height={260}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis tick={ax} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/><Tooltip content={<Tip/>} cursor={false}/><Legend wrapperStyle={{fontSize:12}}/><Bar dataKey="cash_cost" name="Cash cost/BTC" fill={color} radius={[3,3,0,0]} opacity={.7}/><Line type="monotone" dataKey="all_in_cost" name="All-in cost/BTC" stroke="#FF6B9D" strokeWidth={2} dot={{r:3}} connectNulls/></ComposedChart></W>}

export function CompanyEfficiencyChart({data,color}){return<W title="Mining efficiency (J/TH) & miner fleet" height={240}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#21262d"/><XAxis dataKey="quarter" tick={ax}/><YAxis yAxisId="left" tick={ax}/><YAxis yAxisId="right" orientation="right" tick={ax}/><Tooltip content={<Tip/>} cursor={false}/><Legend wrapperStyle={{fontSize:12}}/><Line yAxisId="left" type="monotone" dataKey="efficiency" name="J/TH" stroke={color} strokeWidth={2} dot={{r:3}} connectNulls/><Bar yAxisId="right" dataKey="miner_count" name="Miners" fill="#30363d" radius={[3,3,0,0]} opacity={.5}/></ComposedChart></W>}
