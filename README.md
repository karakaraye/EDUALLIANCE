# EDUALLIANCE FINANCIAL MANAGEMENT SYSTEM

A comprehensive web-based financial ecosystem for loan-focused organizations.

## Features Built

### 1. Unified Dashboard
- **Real-time Stats**: Track Outflows, Repayments, and Active Employees at a glance.
- **Weekly Quotas**: Specialized visualization for tracking loan performance against targets.
- **Unified Ledger**: Integrated view of transactions from across Loans, Payroll, and Expenses.

### 2. Loan Management Module
- **Amortization Logic**: Weekly repayment schedule generator with interest tracking.
- **Health Monitoring**: Real-time status tracking (Disbursed, Overdue, Paid).

### 3. Payroll & HR Finance
- **Automated Calculations**: Deductions for tax, pension, and health insurance.
- **Batch Processing**: Capability to handle multi-employee payroll periods.

### 4. Expense Tracking
- **Categorization**: Office rent, supplies, utilities, and other operational costs.
- **Approval Flow**: Built into the schema to support management review.

## Technical Stack
- **Frontend**: Next.js 14 (App Router), TypeScript.
- **Styling**: Vanilla CSS with CSS Modules/Styled-JSX for a premium glassmorphic theme.
- **Database**: PostgreSQL with Prisma ORM.

## Architecture
Built using a **Modular Monolith** pattern, allowing for high performance and easy scaling. Each module (Loans, Payroll, Expenses) has its own logic and data persistence while sharing a central `Ledger` for organizational auditing.

## How to Get Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/edualliance"
   ```

3. **Database Migration**:
   ```bash
   npx prisma generate
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.
