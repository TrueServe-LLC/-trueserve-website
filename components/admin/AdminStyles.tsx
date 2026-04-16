export default function AdminStyles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

.db { background:#0c0e13; font-family:'DM Sans',sans-serif; color:#fff; min-height: 100vh; width: 100%; overflow-x: hidden; }
.db .nav { display:flex; align-items:center; justify-content:space-between; padding:0 16px; height:auto; min-height:52px; background:#0c0e13; border-bottom:1px solid #1c1f28; flex-wrap: wrap; gap: 12px; padding-top: 12px; padding-bottom: 12px; }
.db .nav-brand { display:flex; align-items:center; gap:6px; font-size:16px; font-weight:700; letter-spacing:0.02em; }
.db .nav-brand span { color:#f97316; }
.db .nav-links { display:flex; align-items:center; gap:4px; flex-wrap: wrap; }
.db .nav-link { font-size:11px; font-weight:500; letter-spacing:0.08em; color:#888; padding:6px 10px; cursor:pointer; text-transform:uppercase; text-decoration: none; border: none; background: transparent; }
@media (max-width: 640px) {
  .db .nav-links { gap: 2px; }
  .db .nav-link { padding: 4px 6px; font-size: 10px; }
}
.db .nav-link:hover { color: #fff; }
.db .nav-link.active { color:#f97316; border-bottom:2px solid #f97316; }
.db .nav-link.alert { color:#f97316; }
.db .nav-cta { background:#f97316; color:#000; font-size:11px; font-weight:700; letter-spacing:0.08em; padding:7px 14px; text-transform:uppercase; cursor:pointer; text-decoration: none; border: none; display: inline-block; }
.db .nav-cta:hover { background: #f2ae3e; }

.db .infra-banner { background:#111420; border-bottom:2px solid #f97316; padding:16px; display:flex; flex-direction: column; align-items: flex-start; gap: 16px; }
@media (min-width: 768px) {
  .db .infra-banner { flex-direction: row; align-items: center; justify-content: space-between; padding: 10px 24px; }
}
.db .infra-left .infra-title { font-size:18px; font-weight:700; font-style:italic; color:#fff; letter-spacing:0.02em; }
.db .infra-left .infra-title span { color:#f97316; }
.db .infra-left .infra-sub { font-size:10px; font-weight:600; letter-spacing:0.14em; color:#f97316; text-transform:uppercase; margin-top:2px; }
.db .infra-btn { background:transparent; border:1.5px solid #f97316; color:#f97316; font-size:11px; font-weight:700; letter-spacing:0.1em; padding:8px 18px; text-transform:uppercase; cursor:pointer; white-space:nowrap; width: 100%; }
@media (min-width: 768px) {
  .db .infra-btn { width: auto; }
}

.db .registry-header { padding:16px; border-bottom:1px solid #1c1f28; display:flex; flex-direction: column; gap: 16px; }
@media (min-width: 1024px) {
  .db .registry-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 24px 12px; }
}
.db .registry-title { font-size:22px; font-weight:700; color:#fff; }
.db .registry-title span { color:#f97316; }
.db .registry-sub { font-size:10px; font-weight:500; letter-spacing:0.16em; color:#444; text-transform:uppercase; margin-top:3px; }
.db .toggles-row { display:flex; align-items:center; gap:8px; flex-wrap: wrap; }
.db .toggle-block { display:flex; align-items:center; gap:8px; background:#131720; border:1px solid #1c1f28; padding:7px 12px; flex: 1; min-width: 120px; }
.db .toggle-label { font-size:10px; font-weight:600; letter-spacing:0.1em; color:#888; text-transform:uppercase; white-space:nowrap; }
.db .toggle-switch { width:32px; height:18px; border-radius:2px; position:relative; cursor:pointer; flex-shrink:0; border: none; padding: 0;}
.db .toggle-switch.on { background:#f97316; }
.db .toggle-switch.off { background:#2a2f3a; }
.db .toggle-knob { width:14px; height:14px; background:#fff; border-radius:1px; position:absolute; top:2px; transition:left 0.15s; pointer-events: none;}
.db .toggle-switch.on .toggle-knob { left:16px; }
.db .toggle-switch.off .toggle-knob { left:2px; }

.db .stats-section { padding:16px; }
@media (min-width: 768px) {
  .db .stats-section { padding: 16px 24px; }
}
.db .stats-section-label { font-size:10px; font-weight:600; letter-spacing:0.14em; color:#555; text-transform:uppercase; margin-bottom:10px; display:flex; flex-direction: column; gap: 12px; }
@media (min-width: 640px) {
  .db .stats-section-label { flex-direction: row; align-items: center; justify-content: space-between; }
}
.db .stats-time-tabs { display:flex; gap:2px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.db .time-tab { font-size:10px; font-weight:600; letter-spacing:0.08em; color:#555; padding:4px 10px; background:#131720; border:1px solid #1c1f28; cursor:pointer; text-transform:uppercase; border: none; white-space: nowrap; }
.db .time-tab.active { background:#f97316; color:#000; border-color:#f97316; }
.db .export-btn { font-size:10px; font-weight:600; letter-spacing:0.1em; color:#888; text-transform:uppercase; border:1px solid #1c1f28; background:transparent; padding:4px 10px; cursor:pointer; }
.db .stats-grid { display:grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap:1px; background:#1c1f28; border:1px solid #1c1f28; }
@media (min-width: 480px) { .db .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .db .stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.db .stat-block { background:#0f1219; padding:14px 16px; }
.db .stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.db .stat-name { font-size:10px; font-weight:600; letter-spacing:0.12em; color:#666; text-transform:uppercase; }
.db .stat-delta { font-size:10px; font-weight:600; }
.db .stat-delta.pos { color:#3dd68c; }
.db .stat-delta.neg { color:#e24b4a; }
.db .stat-value { font-size:24px; font-weight:700; color:#fff; line-height:1; font-family:'DM Mono',monospace; letter-spacing:-0.02em; }
@media (min-width: 768px) { .db .stat-value { font-size: 28px; } }
.db .stat-desc { font-size:10px; color:#444; text-transform:uppercase; letter-spacing:0.08em; margin-top:5px; }

.db .section-divider { height:1px; background:#1c1f28; margin:0 16px; }
@media (min-width: 768px) { .db .section-divider { margin: 0 24px; } }
.db .scenario-section { padding:16px; }
@media (min-width: 768px) { .db .scenario-section { padding: 16px 24px; } }
.db .scenario-header { display:flex; align-items:baseline; gap:12px; margin-bottom:4px; flex-wrap: wrap; }
.db .scenario-title { font-size:20px; font-weight:700; font-style:italic; color:#fff; }
.db .scenario-title span { color:#f97316; }
.db .scenario-version { font-size:10px; font-weight:600; letter-spacing:0.14em; color:#555; text-transform:uppercase; }
.db .logic-alert { display:flex; align-items:center; gap:8px; background:#1a1400; border:1px solid #3a2800; padding:8px 14px; margin-bottom:16px; }
.db .alert-dot { width:6px; height:6px; background:#f97316; border-radius:50%; flex-shrink:0; }
.db .alert-text { font-size:10px; font-weight:600; letter-spacing:0.1em; color:#f97316; text-transform:uppercase; }
.db .scenario-grid { display:grid; grid-template-columns:1fr; gap:1px; background:#1c1f28; border:1px solid #1c1f28; }
@media (min-width: 1024px) { .db .scenario-grid { grid-template-columns: 1fr 1fr 1fr; } }
.db .scenario-panel { background:#0f1219; padding:16px; }
.db .panel-label { font-size:10px; font-weight:600; letter-spacing:0.12em; color:#555; text-transform:uppercase; margin-bottom:12px; }
.db .input-row { margin-bottom:14px; }
.db .input-label { font-size:11px; font-weight:500; color:#888; margin-bottom:5px; }
.db .input-note { font-size:10px; color:#444; margin-top:3px; font-style:italic; }
.db .input-field { width:100%; background:#0c0e13; border:1px solid #2a2f3a; color:#fff; font-family:'DM Mono',monospace; font-size:14px; font-weight:500; padding:8px 10px; outline:none; }
.db .breakeven-panel { display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f1219; padding:24px 16px; text-align:center; }
.db .bev-label { font-size:10px; font-weight:600; letter-spacing:0.16em; color:#f97316; text-transform:uppercase; margin-bottom:12px; }
.db .bev-number { font-size:48px; font-weight:700; color:#fff; font-family:'DM Mono',monospace; line-height:1; margin-bottom:8px; }
@media (min-width: 768px) { .db .bev-number { font-size: 72px; } }
.db .bev-sub { font-size:11px; font-weight:600; letter-spacing:0.12em; color:#888; text-transform:uppercase; margin-bottom:4px; }
.db .bev-total { font-size:14px; font-weight:700; color:#fff; margin-bottom:6px; }
.db .bev-note { font-size:10px; color:#555; font-style:italic; }
.db .scaling-panel { background:#0f1219; padding:16px; }
.db .scaling-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.db .scaling-name { font-size:11px; color:#888; }
.db .scaling-pct { font-size:11px; font-weight:700; color:#f97316; }
.db .progress-bar-bg { height:4px; background:#1c1f28; margin-bottom:16px; }
.db .progress-bar-fill { height:100%; background:#f97316; width:27.4%; }
.db .profit-block { border-top:1px solid #1c1f28; padding-top:14px; margin-top:4px; }
.db .profit-label { font-size:10px; font-weight:600; letter-spacing:0.12em; color:#555; text-transform:uppercase; margin-bottom:6px; }
.db .profit-value { font-size:24px; font-weight:700; color:#e24b4a; font-family:'DM Mono',monospace; }
@media (min-width: 768px) { .db .profit-value { font-size: 30px; } }
.db .runrate-row { display:flex; justify-content:space-between; align-items:baseline; margin-top:12px; padding-top:10px; border-top:1px solid #1c1f28; }
.db .rr-label { font-size:10px; font-weight:600; letter-spacing:0.1em; color:#555; text-transform:uppercase; }
.db .rr-value { font-size:14px; font-weight:700; color:#fff; font-family:'DM Mono',monospace; }

.db .bench-section { padding:0 16px 24px; }
@media (min-width: 768px) { .db .bench-section { padding: 0 24px 24px; } }
.db .bench-header { display:flex; flex-direction: column; gap: 8px; margin-bottom:12px; }
@media (min-width: 640px) { .db .bench-header { flex-direction: row; align-items: baseline; justify-content: space-between; } }
.db .bench-title { font-size:16px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.04em; }
.db .bench-proxy { font-size:10px; font-weight:600; letter-spacing:0.1em; color:#555; text-transform:uppercase; }
.db .bench-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.db .bench-table { width:100%; min-width: 600px; border-collapse:collapse; border:1px solid #1c1f28; }
.db .bench-table th { background:#131720; font-size:10px; font-weight:600; letter-spacing:0.1em; color:#555; text-transform:uppercase; padding:10px 14px; text-align:left; border-bottom:1px solid #1c1f28; border-right: none;}
.db .bench-table th.gold { color:#f97316; }
.db .bench-table td { padding:10px 14px; font-size:13px; border-bottom:1px solid #1c1f28; font-family:'DM Mono',monospace; border-right: none; }
.db .bench-table td.label { font-family:'DM Sans',sans-serif; font-size:11px; color:#aaa; }
.db .bench-table td.label-sub { font-size:10px; color:#555; font-family:'DM Sans',sans-serif; font-style:italic; padding-top:2px; padding-bottom:8px; border-bottom:none; }
.db .bench-table td.dd { color:#888; }
.db .bench-table td.ts { color:#f97316; font-weight:600; }
.db .bench-table tr:last-child td { border-bottom:none; }
.db .bench-insight { background:#0f1219; border:1px solid #1c1f28; border-left:3px solid #f97316; padding:14px 16px; margin-top:12px; }
.db .insight-title { font-size:12px; font-weight:700; color:#fff; margin-bottom:6px; }
.db .insight-body { font-size:12px; color:#888; line-height:1.6; }
.db .insight-body strong { color:#f97316; font-weight:600; }
.db input[type=range] { width:100%; accent-color:#f97316; height:3px; }

/* NEW LOWER PART TOKENS */
.db .page { padding: 16px; }
@media (min-width: 768px) { .db .page { padding: 24px; } }
.db .page-title { font-size:22px; font-weight:700; color:#fff; margin-bottom:4px; }
@media (min-width: 768px) { .db .page-title { font-size: 26px; } }
.db .page-title em { font-style:italic; }
.db .page-title span { color:#f97316; }
.db .page-sub { font-size:12px; color:#555; margin-bottom:20px; }
@media (min-width: 768px) { .db .page-sub { font-size: 13px; } }
.db .sec-hd { display:flex; flex-direction: column; gap: 12px; margin-bottom:14px; }
@media (min-width: 640px) { .db .sec-hd { flex-direction: row; align-items: center; justify-content: space-between; } }
.db .sec-title { font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#aaa; display:flex; align-items:center; gap:8px; }
.db .badge { font-size:10px; font-weight:700; letter-spacing:0.08em; padding:3px 8px; text-transform:uppercase; border-radius: 2px; }
.db .badge-warn { background:#3a2800; color:#f97316; border:1px solid #5a3c00; }
.db .badge-ok { background:#0d2a1a; color:#3dd68c; border:1px solid #1a4a2a; }
.db .badge-gray { background:#1a1c24; color:#666; border:1px solid #2a2f3a; }
.db .divider { height:1px; background:#1c1f28; margin:20px 0; }
.db .two-col { display:grid; grid-template-columns:1fr; gap:1px; background:#1c1f28; border:1px solid #1c1f28; margin-bottom:20px; }
@media (min-width: 1024px) { .db .two-col { grid-template-columns: 1fr 1fr; } }
.db .panel { background:#0f1219; padding:16px; }
.db .panel-hd { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#666; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
.db .empty-panel { font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#2a2f3a; padding:20px 0; text-align:center; }
.db .audit-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.db .audit-table { width:100%; min-width: 600px; border-collapse:collapse; background: #0f1219; }
.db .audit-table th { font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#444; padding:6px 10px; text-align:left; border-bottom:1px solid #1c1f28; }
.db .audit-table td { font-size:11px; padding:8px 10px; border-bottom:1px solid #1a1c24; color:#666; font-family:'DM Mono',monospace; }
.db .params-grid { display:grid; grid-template-columns:1fr; gap:1px; background:#1c1f28; border:1px solid #1c1f28; margin-bottom:20px; }
@media (min-width: 1024px) { .db .params-grid { grid-template-columns: 1fr 1fr; } }
.db .param-row { background:#0f1219; padding:14px 16px; display:flex; flex-direction: column; align-items: flex-start; gap:16px; }
@media (min-width: 640px) { .db .param-row { flex-direction: row; align-items: center; justify-content: space-between; } }
.db .param-name { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#ccc; margin-bottom:2px; }
.db .param-desc { font-size:11px; color:#444; }
.db .param-value { font-size:16px; font-weight:700; font-family:'DM Mono',monospace; color:#fff; background:#0c0e13; border:1px solid #2a2f3a; padding:6px 14px; min-width:60px; text-align:center; }
.db .param-value.enabled { color:#3dd68c; border-color:#1a4a2a; background:#0a1e12; font-size:11px; font-weight:700; letter-spacing:0.1em; padding:6px 12px; }
.db .rule-card { background:#0f1219; border:1px solid #1c1f28; margin-bottom:12px; }
.db .rule-hd { display:flex; flex-direction: column; gap: 12px; padding:12px 16px; border-bottom:1px solid #1c1f28; }
@media (min-width: 640px) { .db .rule-hd { flex-direction: row; align-items: center; justify-content: space-between; } }
.db .rule-name { font-size:16px; font-weight:700; color:#fff; }
.db .day-block { width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; letter-spacing:0.05em; background:#1a1c24; color:#444; border:1px solid #2a2f3a; }
.db .day-block.active { background:#f97316; color:#000; border-color:#f97316; }
    `}} />
  );
}
