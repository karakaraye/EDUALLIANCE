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
