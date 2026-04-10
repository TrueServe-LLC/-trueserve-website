import { getDriverOrRedirect } from "@/lib/driver-auth";
import DriverMap from "@/components/DriverMap";

export const dynamic = 'force-dynamic';

export default async function DriverEarnings() {
    const driver = await getDriverOrRedirect();
    const balance = driver?.balance || 0;
    const driverLat = typeof driver?.currentLat === "number" ? driver.currentLat : null;
    const driverLng = typeof driver?.currentLng === "number" ? driver.currentLng : null;

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 0; }
                .two-col-ledger { display: grid; grid-template-columns: 1fr 360px; gap: 1px; background: #1c1f28; border-bottom: 1px solid #1c1f28; }
                @media (max-width: 1024px) { .two-col-ledger { grid-template-columns: 1fr; } }
                
                .ledger-left { background: #0c0c0e; padding: 32px; }
                .ledger-right { background: #080808; padding: 32px; display: flex; flex-direction: column; gap: 20px; }

                .section-hd-title { font-family: 'Barlow Condensed', sans-serif; font-size: 48px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: -0.02em; line-height: 0.9; margin-bottom: 8px; }
                .section-hd-title span { color: #e8a230; }
                .section-hd-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #333; margin-bottom: 32px; display: block; }

                .ledger-table-wrap { overflow-x: auto; }
                .ledger-table { width: 100%; border-collapse: collapse; border: 1px solid #1c1f28; margin-bottom: 14px; }
                .ledger-table th { background: #0f1219; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #444; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1c1f28; }
                .ledger-table td { padding: 11px 14px; border-bottom: 1px solid #131720; font-size: 12px; font-family: 'DM Mono', monospace; color: #888; }
                .ledger-table td.log-name { color: #ccc; font-weight: 500; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; }
                .ledger-table td.settlement { color: #3dd68c; font-weight: 600; }

                .heatmap-block { background: #0c0e13; border: 1px solid #1c1f28; }
                .heatmap-hd { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #1c1f28; }
                .heatmap-dot { width: 7px; height: 7px; background: #e8a230; border-radius: 50%; }
                .heatmap-title { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e8a230; }
                .heatmap-visual { height: 160px; background: #0c0e13; display: flex; align-items: center; justify-content: center; position: relative; }
                .heatmap-status { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-top: 1px solid #1c1f28; }
                .heatmap-status-txt { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #333; }

                .pickup-card { background: #0c0e13; border: 1px solid #1c1f28; }
                .pickup-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid #1c1f28; }
                .pickup-type { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; }
                .pickup-mesh { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: #0d2a1a; color: #3dd68c; border: 1px solid #1a4a2a; }
                .pickup-body { padding: 14px; }
                .pickup-name-txt { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; margin-bottom: 2px; }
                .tip-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; background: #1a1200; color: #e8a230; border: 1px solid #3a2800; }
                .pickup-address-txt { font-size: 11px; font-family: 'DM Mono', monospace; color: #444; margin: 8px 0 12px; }
                .pickup-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
                .nav-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px; background: #e8a230; border: none; color: #000; cursor: pointer; text-align: center; }
                .contact-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px; background: transparent; border: 1px solid #2a2f3a; color: #888; cursor: pointer; text-align: center; }
                .confirm-row { display: flex; align-items: center; gap: 8px; padding: 12px 0; border-top: 1px solid #1c1f28; cursor: pointer; transition: background .15s; }
                .confirm-row:hover { background: #1a1200; }
                .confirm-icon { width: 28px; height: 28px; background: #131720; border: 1px solid #2a2f3a; display: flex; align-items: center; justify-content: center; }
                .confirm-text { font-size: 11px; font-weight: 700; color: #888; letter-spacing: 0.05em; text-transform: uppercase; }

                .mission-ctrl-block { background: #0c0e13; border: 1px solid #1c1f28; padding: 14px; }
                .mc-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .mc-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; font-style: italic; text-transform: uppercase; color: #fff; }
                .sector-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: #0d2a1a; color: #3dd68c; border: 1px solid #1a4a2a; }
                .go-offline-btn { width: 100%; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 10px; background: transparent; border: 1.5px solid #e24b4a; color: #e24b4a; cursor: pointer; margin-top: 8px; }

                .liquidity-block { background: #0c0e13; border: 1px solid #1c1f28; padding: 14px; }
                .liq-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
                .liq-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; font-style: italic; text-transform: uppercase; color: #fff; }
                .liq-balance-val { font-size: 32px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; margin-bottom: 12px; }
                .cash-out-btn { width: 100%; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 11px; background: #e8a230; border: none; color: #000; cursor: pointer; }

                @media (max-width: 768px) {
                    .ledger-left, .ledger-right { padding: 18px; }
                    .section-hd-title { font-size: 34px; }
                    .section-hd-sub { margin-bottom: 20px; letter-spacing: 0.14em; }
                    .pickup-actions { grid-template-columns: 1fr; }
                }

                @media (max-width: 480px) {
                    .section-hd-title { font-size: 30px; }
                    .ledger-table th, .ledger-table td { padding: 9px 10px; }
                    .heatmap-visual { height: 200px; }
                    .liq-balance-val { font-size: 26px; }
                }
            ` }} />
            
            <div className="two-col-ledger">
                <div className="ledger-left">
                    <div className="section-hd-title">Ledger <span>&amp; Mesh</span></div>
                    <div className="section-hd-sub">Historical yield and sector forecasting</div>
                    
                    <div className="ledger-table-wrap">
                        <table className="ledger-table">
                            <thead><tr><th>Timeline</th><th>Dispatch</th><th>Yield</th><th>Settlement</th></tr></thead>
                            <tbody>
                                <tr><td className="log-name">Sync Log 26</td><td>2.5 MI Link</td><td>$3.25</td><td className="settlement">$8.95</td></tr>
                                <tr><td className="log-name">Sync Log 25</td><td>5 MI Link</td><td>$3.50</td><td className="settlement">$13.30</td></tr>
                                <tr><td className="log-name">Sync Log 24</td><td>7.5 MI Link</td><td>$3.75</td><td className="settlement">$13.85</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="heatmap-block">
                        <div className="heatmap-hd"><div className="heatmap-dot"></div><div className="heatmap-title">Smart Heatmap</div></div>
                        <div className="heatmap-visual !h-[280px] !p-3">
                            <DriverMap
                                className="h-full w-full"
                                initialCenter={driverLat !== null && driverLng !== null ? { lat: driverLat, lng: driverLng } : null}
                            />
                        </div>
                        <div className="heatmap-status"><div className="heatmap-status-txt">Live demand zones</div><div className="heatmap-status-txt">Based on your location</div></div>
                    </div>
                </div>

                <div className="ledger-right">
                    <div className="pickup-card">
                        <div className="pickup-card-hd"><div className="pickup-type">Pickup Mission</div><div className="pickup-mesh">Mesh Active</div></div>
                        <div className="pickup-body">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="pickup-name-txt">Emerald Kitchen</div>
                                <div className="tip-tag">$4.00 Tip</div>
                            </div>
                            <div className="pickup-address-txt">842 Poplar Tent Rd, Concord NC</div>
                            <div className="pickup-actions">
                                <button className="nav-btn">Nav → Sector</button>
                                <button className="contact-btn">Contact Customer</button>
                            </div>
                            <div className="confirm-row">
                                <div className="confirm-icon">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="2" width="9" height="9" rx="1" stroke="#888" strokeWidth="1.2"/><path d="M4.5 6.5l1.5 1.5 2.5-3" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                </div>
                                <div className="confirm-text">Confirm Pickup with Photo</div>
                            </div>
                            <div className="text-center text-[10px] font-bold text-[#e24b4a] uppercase tracking-widest pt-4 border-t border-[#1c1f28] cursor-pointer hover:opacity-80 mt-1">
                                Terminate Mission Connection
                            </div>
                        </div>
                    </div>

                    <div className="mission-ctrl-block">
                        <div className="mc-hd"><div className="mc-title">Mission Control</div><div className="sector-badge">Sector Active</div></div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Main Sector</span>
                            <span className="text-xs font-mono font-bold text-white">Downtown Grid</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Hourly Yield</span>
                            <span className="text-xs font-mono font-bold text-[#e8a230]">$24.50 Est.</span>
                        </div>
                        <button className="go-offline-btn">Go Offline</button>
                    </div>

                    <div className="liquidity-block">
                        <div className="liq-hd"><div className="liq-title">Rapid Liquidity</div><div className="settlement-tag bg-[#1a1200] border border-[#3a2800] text-[#e8a230] text-[9px] px-2 py-0.5 uppercase font-bold">3 Ready</div></div>
                        <div className="text-[9px] font-bold text-[#444] uppercase tracking-widest mb-4">Liquid balance available</div>
                        <div className="text-[9px] font-bold text-[#e8a230] uppercase tracking-widest mb-1">Liquid Balance</div>
                        <div className="liq-balance-val">${balance.toFixed(2)}</div>
                        <button className="cash-out-btn">Cash Out Funds</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
