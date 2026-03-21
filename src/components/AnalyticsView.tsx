'use client';

import React from 'react';
import { Card } from './Card';

interface AnalyticsViewProps {
    type: 'summary' | 'loans' | 'payroll' | 'expenses';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ type }) => {
    return (
        <div className="analytics-view">
            <div className="charts-grid">
                {/* Loan Health / Performance */}
                <Card title="Revenue vs Outflow" subtitle="Monthly financial efficiency">
                    <div className="bar-chart-container">
                        {[60, 80, 45, 90, 70, 85].map((h, i) => (
                            <div key={i} className="bar-set">
                                <div className="dual-bars">
                                    <div className="bar inflow" style={{ height: `${h}%` }}></div>
                                    <div className="bar outflow" style={{ height: `${h * 0.7}%` }}></div>
                                </div>
                                <span className="label">M{i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <span className="dot inflow"></span> Inflow
                        <span className="dot outflow"></span> Outflow
                    </div>
                </Card>

                {/* Expense Distribution */}
                <Card title="Expense Allocation" subtitle="Operational distribution (%)">
                    <div className="pie-container">
                        <div className="donut-hole">
                            <div className="donut-content">
                                <span className="pct">72%</span>
                                <span className="sub">Budget Utilized</span>
                            </div>
                        </div>
                        <div className="pie-slice p1"></div>
                        <div className="pie-slice p2"></div>
                        <div className="pie-slice p3"></div>
                    </div>
                    <div className="pie-legend">
                        <div className="leg-i"><span className="dot d1"></span> Salaries (45%)</div>
                        <div className="leg-i"><span className="dot d2"></span> Rent & Utils (35%)</div>
                        <div className="leg-i"><span className="dot d3"></span> Others (20%)</div>
                    </div>
                </Card>

                {/* Loan Repayment Trends */}
                <Card title="Repayment Velocity" subtitle="Weekly collection efficiency">
                    <div className="line-chart-placeholder">
                        <svg viewBox="0 0 400 150" className="chart-svg">
                            <path d="M0,120 Q50,100 100,60 T200,80 T300,30 T400,10" fill="none" stroke="var(--primary)" strokeWidth="3" />
                            <path d="M0,150 Q50,130 100,90 T200,110 T300,60 T400,40" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="5,5" />
                            {/* Data Points */}
                            <circle cx="100" cy="60" r="4" fill="var(--primary)" />
                            <circle cx="200" cy="80" r="4" fill="var(--primary)" />
                            <circle cx="300" cy="30" r="4" fill="var(--primary)" />
                        </svg>
                    </div>
                    <div className="chart-legend">
                        <span className="dot line-solid"></span> Actual
                        <span className="dot line-dash"></span> Target
                    </div>
                </Card>

                {/* Team Performance / Quotas */}
                <Card title="Departmental Quotas" subtitle="Target Achievement Matrix">
                    <div className="quota-matrix">
                        {['Loan Unit', 'HR', 'Finance'].map(unit => (
                            <div key={unit} className="quota-row">
                                <span className="unit-name">{unit}</span>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: unit === 'HR' ? '92%' : '75%' }}></div>
                                </div>
                                <span className="unit-val">{unit === 'HR' ? '92%' : '75%'}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <style jsx>{`
        .analytics-view {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .bar-chart-container {
          height: 200px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          padding-top: 20px;
        }

        .bar-set { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .dual-bars { display: flex; align-items: flex-end; gap: 4px; height: 160px; }
        .bar { width: 12px; border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
        .bar.inflow { background: var(--primary); }
        .bar.outflow { background: var(--secondary); }
        .label { font-size: 10px; color: var(--text-muted); }

        .pie-container {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          margin: 20px auto;
          background: conic-gradient(var(--primary) 0% 45%, var(--secondary) 45% 80%, var(--success) 80% 100%);
          position: relative;
        }

        .donut-hole {
          position: absolute;
          inset: 20px;
          background: #1e293b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .donut-content { display: flex; flex-direction: column; align-items: center; }
        .pct { font-size: 20px; font-weight: 800; color: var(--text); }
        .sub { font-size: 10px; color: var(--text-muted); }

        .pie-legend, .chart-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          flex-wrap: wrap;
          font-size: 11px;
          color: var(--text-muted);
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .inflow { background: var(--primary); }
        .outflow { background: var(--secondary); }
        .d1 { background: var(--primary); }
        .d2 { background: var(--secondary); }
        .d3 { background: var(--success); }
        .line-solid { background: var(--primary); border-radius: 0; height: 2px; width: 12px; }
        .line-dash { border-top: 2px dashed var(--secondary); background: none; border-radius: 0; width: 12px; }

        .line-chart-placeholder { height: 180px; padding-top: 20px; }
        .chart-svg { width: 80%; height: 100%; display: block; margin: 0 auto; overflow: visible; }

        .quota-matrix { display: flex; flex-direction: column; gap: 16px; padding: 20px 0; }
        .quota-row { display: flex; align-items: center; gap: 12px; }
        .unit-name { width: 80px; font-size: 12px; }
        .progress-bg { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 4px; }
        .unit-val { font-size: 12px; font-weight: 700; width: 40px; }
      `}</style>
        </div>
    );
};
