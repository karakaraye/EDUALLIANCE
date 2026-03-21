import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      <label className="label">{label}</label>
      <input
        className={`input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
      {helperText && !error && <span className="helper-text">{helperText}</span>}

      <style jsx>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          width: 100%;
        }

        .label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .input-field {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          color: var(--text-main);
          font-family: inherit;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .input-field.error {
          border-color: var(--error);
        }

        .input-field.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }

        .error-message {
          font-size: 12px;
          color: var(--error);
          font-weight: 500;
        }

        .helper-text {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
