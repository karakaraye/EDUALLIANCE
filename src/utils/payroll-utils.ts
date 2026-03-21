/**
 * Logic for salary calculations including exact allowance and deduction figures inputted by the user.
 */

export interface SalaryBreakdown {
    gross: number;
    pension: number;
    paye: number;
    totalDeductions: number;
    net: number;
}

export const calculatePayroll = (
    baseSalary: number, 
    totalAllowances: number = 0,
    pension: number = 0,
    paye: number = 0
): SalaryBreakdown => {
    
    const gross = baseSalary + totalAllowances;
    const totalDeductions = pension + paye;
    const net = gross - totalDeductions;

    return {
        gross,
        pension,
        paye,
        totalDeductions,
        net,
    };
};
