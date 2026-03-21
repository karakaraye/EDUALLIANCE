'use client';

import React, { useState } from 'react';
import { Card } from '../Card';
import { Input } from '../Input';
import { Button } from '../Button';
import { calculateAmortizedRepayment } from '@/utils/loan-utils';

interface LoanApplicationFormProps {
  onClose?: () => void;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onClose }) => {
  const FIXED_INTEREST_RATE = 15; // Fixed interest rate at 15%
  const MIN_PRINCIPAL = 1000;
  const MIN_DURATION = 4;
  const MAX_DURATION = 52; // 1 year max

  const [formData, setFormData] = useState({
    borrowerName: '',
    amount: '',
    duration: '12',
  });

  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ amount?: string; duration?: string; name?: string }>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; duration?: string; name?: string } = {};

    if (!formData.borrowerName.trim()) {
      newErrors.name = 'Borrower name is required';
    }

    const amount = Number(formData.amount);
    if (!formData.amount || amount < MIN_PRINCIPAL) {
      newErrors.amount = `Minimum loan amount is ₦${MIN_PRINCIPAL.toLocaleString()}`;
    }

    const duration = Number(formData.duration);
    if (!formData.duration || duration < MIN_DURATION) {
      newErrors.duration = `Minimum duration is ${MIN_DURATION} weeks`;
    } else if (duration > MAX_DURATION) {
      newErrors.duration = `Maximum duration is ${MAX_DURATION} weeks`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const schedule = calculateAmortizedRepayment(
      Number(formData.amount),
      FIXED_INTEREST_RATE, // Use fixed rate
      Number(formData.duration)
    );
    setPreview(schedule);
  };

  const handleConfirmLoan = () => {
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    // TODO: Submit to backend API
    console.log('Loan application submitted:', {
      borrowerName: formData.borrowerName,
      principal: formData.amount,
      duration: formData.duration,
      interestRate: FIXED_INTEREST_RATE,
      schedule: preview
    });

    if (onClose) onClose();
  };

  return (
    <div className="loan-form-wrapper">
      <form onSubmit={handleCalculate} className="form-grid">
        <Input
          label="Borrower Full Name"
          placeholder="e.g. Jane Smith"
          value={formData.borrowerName}
          onChange={(e) => {
            setFormData({ ...formData, borrowerName: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          error={errors.name}
          required
        />

        <div className="row">
          <Input
            label="Principal Amount (₦)"
            type="number"
            placeholder="5000"
            value={formData.amount}
            onChange={(e) => {
              setFormData({ ...formData, amount: e.target.value });
              if (errors.amount) setErrors({ ...errors, amount: undefined });
            }}
            error={errors.amount}
            helperText={`Minimum: ₦${MIN_PRINCIPAL.toLocaleString()}`}
            required
          />
          <Input
            label="Duration (Weeks)"
            type="number"
            value={formData.duration}
            onChange={(e) => {
              setFormData({ ...formData, duration: e.target.value });
              if (errors.duration) setErrors({ ...errors, duration: undefined });
            }}
            error={errors.duration}
            helperText={`Range: ${MIN_DURATION}-${MAX_DURATION} weeks`}
            required
          />
        </div>

        <div className="interest-rate-display">
          <label>Interest Rate</label>
          <div className="rate-value">{FIXED_INTEREST_RATE}% (Annual)</div>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" fullWidth>Calculate Repayment Schedule</Button>
        </div>
      </form>

      {preview.length > 0 && (
        <div className="preview-section">
          <h4>Repayment Preview</h4>
          <div className="preview-scroll">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.period}</td>
                    <td>{item.dueDate.toLocaleDateString()}</td>
                    <td>₦{item.total.toFixed(2)}</td>
                  </tr>
                ))}
                {preview.length > 5 && <tr><td colSpan={3}>... and {preview.length - 5} more weeks</td></tr>}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" fullWidth className="mt-4" onClick={handleConfirmLoan}>Confirm & Disburse Loan</Button>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirm-box">
            <h3>⚠️ Confirm Loan Disbursement</h3>
            <div className="confirm-details">
              <p><strong>Borrower:</strong> {formData.borrowerName}</p>
              <p><strong>Principal:</strong> ₦{Number(formData.amount).toLocaleString()}</p>
              <p><strong>Duration:</strong> {formData.duration} weeks</p>
              <p><strong>Interestrate:</strong> {FIXED_INTEREST_RATE}%</p>
              <p><strong>Total Repayment:</strong> ₦{preview.reduce((sum, p) => sum + p.total, 0).toFixed(2)}</p>
            </div>
            <div className="confirm-actions">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleFinalSubmit}>Confirm & Submit</Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loan-form-wrapper {
          padding: 24px;
        }
        
        .form-grid {
          display: flex;
          flex-direction: column;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .interest-rate-display {
          margin-bottom: 20px;
        }
        
        .interest-rate-display label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        
        .interest-rate-display .rate-value {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
        }
        
        .preview-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .preview-section h4 {
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .preview-scroll {
          max-height: 250px;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .preview-table th {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          font-weight: 600;
          text-align: left;
          padding: 12px 16px;
          position: sticky;
          top: 0;
          backdrop-filter: blur(8px);
        }
        .preview-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        .preview-table tr:last-child td {
          border-bottom: none;
        }
        .mt-4 { margin-top: 24px; }
        
        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        .confirm-box {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
        }
        
        .confirm-box h3 {
          font-size: 20px;
          margin-bottom: 20px;
          color: var(--text-main);
        }
        
        .confirm-details {
          background: rgba(255, 255, 255, 0.03);
          padding: 20px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }
        
        .confirm-details p {
          margin: 8px 0;
          font-size: 14px;
          color: var(--text-main);
        }
        
        .confirm-details strong {
          color: var(--text-muted);
          font-weight: 600;
          margin-right: 8px;
        }
        
        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};
