import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'loans', label: 'Loans', icon: '💸' },
  { id: 'payroll', label: 'Payroll', icon: '📋' },
  { id: 'expenses', label: 'Expenses', icon: '💳' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <ul className="nav-links">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => onTabChange(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            System Online
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--border);
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .nav-links {
          list-style: none;
          flex: 1;
        }

        .nav-links li {
          padding: 14px 18px;
          border-radius: var(--radius-md);
          margin-bottom: 8px;
          color: var(--text-muted);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          font-weight: 500;
          border: 1px solid transparent;
        }

        .nav-links li:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          transform: translateX(4px);
        }

        .nav-links li.active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          box-shadow: 0 8px 20px -5px var(--primary-glow);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .icon {
          font-size: 20px;
          filter: grayscale(1) brightness(1.5);
          transition: all 0.3s ease;
        }

        .active .icon {
          filter: grayscale(0) brightness(1);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--success);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </aside>
  );
};
