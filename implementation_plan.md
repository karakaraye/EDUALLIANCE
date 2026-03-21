# EDUALLIANCE FINANCIAL MANAGEMENT SYSTEM - Implementation Plan

## 1. System Architecture Expansion

The system will follow a **Modular Monolith** architecture using Next.js, ensuring high performance, SEO friendliness, and ease of deployment.

### Core Modules:
- **Auth & User Management**: Role-based access control (Admin, HR, Loan Officer, Finance, Employee).
- **Loan Module**: Application processing, credit scoring, disbursement, repayment tracking, and overdue management.
- **Payroll Module**: Salary structure, tax/deduction calculations, automated payslip generation, and disbursement tracking.
- **Expense Module**: Category management, approval workflows, and receipt attachments.
- **Finance & Accounting**: General ledger, balance sheets, and real-time transaction tracking.
- **Analytics Engine**: Centralized data processing for reporting and visualization.

---

## 2. Integrated Database Schema (PostgreSQL)

### Key Entities:

#### User & Access
- `Users`: id, name, email, role, department_id, status.
- `Permissions`: id, module, action (create, read, update, delete).

#### Loan Management
- `Loans`: id, user_id, amount, interest_rate, duration_weeks, status, remaining_balance.
- `RepaymentSchedule`: loan_id, due_date, amount_due, status (paid, overdue).
- `Quotas`: id, period (weekly/monthly/quarterly), target_amount, achieved_amount.

#### Payroll Management
- `Employees`: id, base_salary, tax_id, bank_details.
- `PayrollPeriods`: id, start_date, end_date, Total_payout.
- `Salaries`: employee_id, period_id, gross, deductions, net, status.

#### Expense Tracking
- `Expenses`: id, category_id, amount, description, date, approved_by, status.
- `Categories`: id, name, budget_limit.

#### Financial Records
- `Transactions`: id, source_type (Loan, Payroll, Expense), source_id, amount, type (Debit/Credit), timestamp.

---

## 3. Business Logic Rules

### Loan Logic
- **Interest Calculation**: Amortized interest based on organization policy.
- **Overdue Logic**: Automatically flag loans as 'Overdue' if `RepaymentSchedule.due_date` passes without full payment.
- **Approval Workflow**: Loans > $X require Senior Admin approval.

### Payroll Logic
- **Automated Calculation**: Net = Gross - (Tax + Pension + Other Deductions).
- **Schedule**: Lock payroll on the 25th of every month for review.

### Expense Logic
- **Budget Check**: Alert if an expense category exceeds its quarterly quota.
- **Multi-step Approval**: Expenses over a threshold require departmental head approval.

---

## 4. Analytics & Reporting

### Dashboards
- **Executive Summary**: Real-time cash flow (Inflow vs. Outflow).
- **Loan Health**: Portfolio at Risk (PAR) and repayment rate.
- **Payroll Breakdown**: Total cost to company per department.

### Visualizations
- Monthly revenue vs. expense charts.
- Weekly team performance metrics (Loans processed vs. Target).

---

## 5. Week-by-Week Development Plan

| Week | Phase | Deliverables |
| :--- | :--- | :--- |
| **Week 1** | Foundation | Project setup, DB Schema design, Auth system (NextAuth). |
| **Week 2** | Loan Module (I) | Loan application UI, DB integration, Repayment schedule generator. |
| **Week 3** | Loan Module (II) | Repayment tracking logic, Interest calculation service, Overdue notifications. |
| **Week 4** | Payroll (I) | Employee profiles, Salary structure setup, Tax logic. |
| **Week 5** | Payroll (II) | Bulk payroll generation, Payslip exporting (PDF), Disbursement logging. |
| **Week 6** | Expense Tracking | Category management, Expense entry form, Receipt upload, Approval flow. |
| **Week 7** | Financial Core | General Ledger implementation, Transaction auto-logging across all modules. |
| **Week 8** | Quotas & Targets | Setting up quarterly/monthly targets for loans and operational budgets. |
| **Week 9** | Analytics (I) | Data aggregation services, Key Performance Indicator (KPI) calculations. |
| **Week 10** | Analytics (II) | Interactive Dashboards, Charts (Chart.js/Recharts), Exportable CSV/PDF reports. |
| **Week 11** | QA & Polish | End-to-end testing, UI/UX refinement, Performance optimization. |
| **Week 12** | Deployment | CI/CD pipeline setup, Final documentation, Production launch. |
