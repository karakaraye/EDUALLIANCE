import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  glass = false,
}) => {
  return (
    <div className={`glass-card ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title text-gradient">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">{children}</div>

      <style jsx>{`
        .card-header {
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }
        .card-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .card-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .card-content {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
