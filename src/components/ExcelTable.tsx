import React from 'react';

interface ExcelTableProps {
  headers: string[];
  data: any[];
  title?: string;
}

export const ExcelTable: React.FC<ExcelTableProps> = ({ headers, data, title }) => {
  return (
    <div className="excel-table-container glass">
      {title && <div className="table-title">{title}</div>}
      <div className="table-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="row-number">#</th>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-number">{rowIdx + 1}</td>
                {Object.values(row).map((val: any, colIdx) => (
                  <td key={colIdx}>
                    <div className="cell-content">
                      {typeof val === 'number' && !isNaN(val) ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) : String(val)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {/* Fill empty rows to look like Excel */}
            {[...Array(Math.max(0, 10 - data.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td className="row-number">{data.length + i + 1}</td>
                {headers.map((_, idx) => <td key={idx}></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .excel-table-container {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
        }

        .table-title {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          border-bottom: 1px solid var(--border);
          letter-spacing: -0.01em;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .excel-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-sans);
          font-size: 13px;
        }

        .excel-table th {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .excel-table td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0;
          color: var(--text-main);
          height: 48px;
        }

        .row-number {
          width: 50px;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-size: 11px;
          border-right: 1px solid var(--border);
        }

        .cell-content {
          padding: 12px 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .excel-table tbody tr:hover {
          background: rgba(139, 92, 246, 0.08);
        }

        .excel-table tbody tr:nth-child(even) {
          background: rgba(255, 255, 255, 0.01);
        }

        .excel-table tbody tr:nth-child(even):hover {
          background: rgba(139, 92, 246, 0.08);
        }

        .empty-row td {
          background: transparent;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};
