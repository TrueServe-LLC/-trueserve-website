'use client';

import React, { useState } from 'react';

export default function ScenarioEngine() {
    const [currentDailyOrders, setCurrentDailyOrders] = useState(25);
    
    // Hardcoded demo logic matches the exact HTML snapshot provided
    const fixedMonthlyCost = 12500;
    const netMarginPerOrder = 4.5;
    
    // Break Even Velocity
    const breakEvenMonthly = Math.ceil(fixedMonthlyCost / netMarginPerOrder);
    const breakEvenDaily = Math.ceil(breakEvenMonthly / 30);
    
    // Scaling Efficiency
    const dailyProfit = (currentDailyOrders * netMarginPerOrder) - (fixedMonthlyCost / 30);
    const percentMet = ((currentDailyOrders / breakEvenDaily) * 100).toFixed(1);
    const annualRunRate = dailyProfit * 365;

    return (
        <>
            <div className="section-divider"></div>
            <div className="scenario-section">
                <div className="scenario-header">
                    <div className="scenario-title"><em>Scenario</em> <span>Engine</span></div>
                    <div className="scenario-version">V2.1 Profitability Projection Logic</div>
                </div>
                <div className="logic-alert">
                    <div className="alert-dot"></div>
                    <span className="alert-text">Logic Alert: Distance B13+B14 Pending Review — Numerator: Inputs!B8 Fixed Cost</span>
                </div>
                <div className="scenario-grid">
                    <div className="scenario-panel">
                        <div className="panel-label">Simulation Inputs</div>
                        <div className="input-row">
                            <div className="input-label">Fixed Monthly Cost ($)</div>
                            <div className="input-field">{fixedMonthlyCost}</div>
                            <div className="input-note">Mapped to Inputs!B8 (Ops, Payroll, Insurance)</div>
                        </div>
                        <div className="input-row">
                            <div className="input-label">Net Margin per Order ($)</div>
                            <div className="input-field">{netMarginPerOrder.toFixed(1)}</div>
                        </div>
                        <div className="input-row">
                            <div className="input-label">Current Orders / Day</div>
                            <input 
                                type="range" 
                                min="0" max="1000" step="1" 
                                value={currentDailyOrders} 
                                onChange={(e) => setCurrentDailyOrders(Number(e.target.value))}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444', fontFamily: "'DM Mono',monospace", marginTop: '4px' }}>
                                <span>0</span>
                                <span style={{ color: '#e8a230', fontWeight: 700 }}>{currentDailyOrders} orders/day</span>
                                <span>1000</span>
                            </div>
                        </div>
                    </div>
                    <div className="breakeven-panel">
                        <div className="bev-label">Break-Even Velocity</div>
                        <div className="bev-number">{breakEvenDaily}</div>
                        <div className="bev-sub">Orders Required Per Day</div>
                        <div className="bev-total">{breakEvenMonthly} Total / Month</div>
                        <div className="bev-note">To cover all North Carolina fixed overhead.</div>
                    </div>
                    <div className="scaling-panel">
                        <div className="panel-label">Scaling Efficiency</div>
                        <div className="scaling-row">
                            <span className="scaling-name">Daily Target</span>
                            <span className="scaling-pct">{percentMet}% Met</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${Math.min(Number(percentMet), 100)}%` }}></div>
                        </div>
                        <div className="profit-block">
                            <div className="profit-label">Current Daily Profit</div>
                            <div className="profit-value" style={{ color: dailyProfit >= 0 ? '#3dd68c' : '#e24b4a' }}>
                                {dailyProfit >= 0 ? '+' : ''}${dailyProfit.toFixed(2)}
                            </div>
                            <div className="runrate-row">
                                <span className="rr-label">Annual Run-Rate</span>
                                <span className="rr-value" style={{ color: annualRunRate >= 0 ? '#3dd68c' : '#fff' }}>
                                    ${annualRunRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>
                                Proxy: AOV as GOV Basis
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bench-section">
                <div className="bench-header">
                    <div className="bench-title">Competitive Benchmark</div>
                    <div className="bench-proxy">Proxy: AOV as GOV Basis</div>
                </div>
                <table className="bench-table">
                    <thead>
                        <tr>
                            <th>Benchmark Metric</th>
                            <th>DoorDash (Est.)</th>
                            <th className="gold">TrueServe</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label">GOV Proxy (AOV)</td>
                            <td className="dd">$38.50</td>
                            <td className="ts">$35.00</td>
                        </tr>
                        <tr>
                            <td className="label-sub" colSpan={3}>Gross Order Value</td>
                        </tr>
                        <tr>
                            <td className="label">Contribution Margin</td>
                            <td className="dd">~-6.5%</td>
                            <td className="ts">12.9%</td>
                        </tr>
                        <tr>
                            <td className="label-sub" colSpan={3}>Net of Direct Variable Costs</td>
                        </tr>
                    </tbody>
                </table>
                <div className="bench-insight">
                    <div className="insight-title">The "Apples-to-Apples" Fix</div>
                    <div className="insight-body">
                        Benchmark reworked to use your actual <strong>Average Order Value (AOV)</strong> as the proxy for DoorDash's GOV. This ensures denominators match exactly.
                    </div>
                </div>
            </div>
        </>
    );
}
