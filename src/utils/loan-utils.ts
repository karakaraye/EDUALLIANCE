/**
 * Logic for calculating loan repayments and interest.
 */

export interface LoanRepayment {
    period: number;
    dueDate: Date;
    principal: number;
    interest: number;
    total: number;
    remainingBalance: number;
}

export const calculateAmortizedRepayment = (
    principal: number,
    annualRate: number,
    durationWeeks: number
): LoanRepayment[] => {
    const weeklyRate = annualRate / 100 / 52;
    const weeklyPayment =
        (principal * weeklyRate * Math.pow(1 + weeklyRate, durationWeeks)) /
        (Math.pow(1 + weeklyRate, durationWeeks) - 1);

    const schedule: LoanRepayment[] = [];
    let remainingBalance = principal;
    const startDate = new Date();

    for (let i = 1; i <= durationWeeks; i++) {
        const interest = remainingBalance * weeklyRate;
        const principalPaid = weeklyPayment - interest;
        remainingBalance -= principalPaid;

        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + i * 7);

        schedule.push({
            period: i,
            dueDate,
            principal: principalPaid,
            interest,
            total: weeklyPayment,
            remainingBalance: Math.max(0, remainingBalance),
        });
    }

    return schedule;
};

export const checkOverdueStatus = (dueDate: Date, isPaid: boolean): boolean => {
    const today = new Date();
    return !isPaid && today > dueDate;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateLoanStatus = (loan: any): 'Active' | 'Paid Full' | 'Overdue' => {
    const amount = Number(loan.amount) || 0;
    const rate = Number(loan.rate) || 0;
    const duration = Number(loan.durationMonths) || 0;
    
    // Quick guard if loan is undefined or invalid
    if (amount <= 0 || duration <= 0) return loan.status || 'Active';

    const interestEarned = amount * (rate / 100) * duration;
    const expectedTotal = amount + interestEarned;
    const monthlyPayment = expectedTotal / duration;
    
    let totalPaid = 0;
    const repayments = loan.repayments || {};
    for (let i = 1; i <= duration; i++) {
        const rec = repayments[i];
        if (rec === true) totalPaid += monthlyPayment;
        else if (typeof rec === 'number') totalPaid += rec;
    }

    if (totalPaid >= expectedTotal - 0.01 || Number(loan.amountLeft) === 0) {
        return 'Paid Full';
    }

    const startDate = new Date(loan.disburseDate);
    if (isNaN(startDate.getTime())) return loan.status || 'Active';
    
    const today = new Date();
    let monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    
    if (today.getDate() < Math.min(startDate.getDate(), 28)) { // handle end of month quirks gently
        monthsElapsed -= 1;
    }
    
    if (monthsElapsed > duration) monthsElapsed = duration;
    
    if (monthsElapsed <= 0) {
        return 'Active';
    }

    const expectedPaidByNow = monthsElapsed * monthlyPayment;
    
    // allow a small fraction of leeway for float mismatches
    if (totalPaid < expectedPaidByNow - 0.01) {
        return 'Overdue';
    }

    return 'Active';
};
