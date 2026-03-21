import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'btn';
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  const sizeStyles = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'btn-full' : ''
    } ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
          gap: 8px;
        }

        .btn:active {
          transform: scale(0.96);
        }

        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-md { padding: 12px 24px; font-size: 14px; }
        .btn-lg { padding: 16px 32px; font-size: 16px; }
        .btn-full { width: 100%; }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          box-shadow: 0 4px 15px -1px var(--primary-glow);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -1px var(--primary-glow);
          filter: brightness(1.1);
        }
        .btn-primary::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -60%;
          width: 20%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(30deg);
          transition: all 0.5s ease;
        }
        .btn-primary:hover::after {
          left: 120%;
        }

        .btn-secondary {
          background: var(--secondary);
          color: white;
          box-shadow: 0 4px 15px -1px var(--secondary-glow);
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -1px var(--secondary-glow);
          filter: brightness(1.1);
        }

        .btn-outline {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border);
          color: var(--text-main);
          backdrop-filter: blur(8px);
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: var(--text-muted);
        }
        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .btn-danger {
          background: var(--error);
          color: white;
          box-shadow: 0 4px 15px -1px rgba(239, 68, 68, 0.3);
        }
        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -1px rgba(239, 68, 68, 0.4);
          filter: brightness(1.1);
        }
      `}</style>
    </button>
  );
};
