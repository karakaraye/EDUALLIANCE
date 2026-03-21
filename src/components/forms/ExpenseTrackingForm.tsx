'use client';

import React, { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';

interface ExpenseTrackingFormProps {
    onClose?: () => void;
}

export const ExpenseTrackingForm: React.FC<ExpenseTrackingFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Utilities',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Utilities', 'Office Supplies', 'Rent', 'Travel', 'Equipment', 'Marketing'];

    return (
        <div className="expense-form-wrapper">
            <form className="expense-form">
                <Input
                    label="Description / Vendor"
                    placeholder="e.g. AWS Cloud Services"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />

                <div className="select-group">
                    <label className="label">Category</label>
                    <select
                        className="select-field"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="row">
                    <Input
                        label="Amount (₦)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div className="upload-box">
                    <span className="icon">📄</span>
                    <span>Upload Receipt (PDF/JPG)</span>
                </div>

                <Button variant="primary" fullWidth className="mt-4" onClick={onClose}>Submit for Approval</Button>
            </form>

            <style jsx>{`
        .expense-form-wrapper { padding: 24px; }
        .expense-form { display: flex; flex-direction: column; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .label { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block; }
        .select-group { margin-bottom: 20px; }
        .select-field {
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text);
          font-family: inherit;
        }
        .upload-box {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .upload-box:hover {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          color: var(--text);
        }
        .icon { display: block; font-size: 24px; margin-bottom: 8px; }
        .mt-4 { margin-top: 24px; }
      `}</style>
        </div>
    );
};
