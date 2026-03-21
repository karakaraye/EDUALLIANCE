# System Architecture: Web-Based Financial Management System

This document outlines the system design based on the "Web-Based Financial Management System Framework" provided.

## 1. Frontend Layer
**Responsibility**: User Interface, Interactivity, and Visual Presentation.
**Technology Stack**: Next.js 14+, React, Tailwind CSS, Lucide Icons.

### Modules
*   **Dashboard Module** (`src/app/page.tsx`)
    *   Executive Command Center (KPIs, Operational Log, Financial Dynamics).
*   **Loan Management Module** (`src/app/loans/`)
    *   Portfolio Manager (`page.tsx`)
    *   Issuance/New Loan (`new/page.tsx`)
    *   Loan Details (`[id]/page.tsx`)
*   **Payroll Management Module** (`src/app/payroll/`)
    *   Staff Salary Processing & History.
*   **Expense Management Module** (`src/app/expenses/`)
    *   Operational Cost Tracking & Categorization.

### Core Components
*   **Navigation & Sidebar**: `src/components/Navigation.tsx` (Top-bar style as per recent design).
*   **Layout Wrapper**: `src/components/DashboardLayout.tsx`.

## 2. Backend Layer (API Endpoints & Controllers)
**Responsibility**: Business Logic, Request Handling, and Data Processing.
**Technology Stack**: Next.js API Routes (Serverless).

### Structure (`src/app/api/`)
*   **Loan Controllers** (`/api/loans`): Handle issuance, status updates, and repayments.
*   **Payroll Controllers** (`/api/payroll`): Handle salary calculations and disbursement records.
*   **Expense Controllers** (`/api/expenses`): Handle expense recording and categorization.
*   **Reporting Module** (`/api/reports`): Aggregation endpoints for the Dashboard and Analytics.

## 3. Data Access Layer & Database
**Responsibility**: Data persistence and retrieval.
**Current State**: Simulation via Service Layer.

### Service Layer (`src/lib/services/`)
*   `loanService.ts`: Abstraction for loan data operations.
*   `payrollService.ts`: Abstraction for payroll data operations.
*   `expenseService.ts`: Abstraction for expense data operations.

### Database Schema (Conceptual)
*   **Loan Database**: Tables for `Loans`, `Borrowers`, `RepaymentSchedules`.
*   **Payroll Database**: Tables for `Employees`, `SalaryRecords`, `TaxInfo`.
*   **Expense Database**: Tables for `Expenses`, `Categories`, `Vendors`.
