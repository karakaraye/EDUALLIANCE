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
    allowances: { housing?: number; transport?: number; lunch?: number; wardrobe?: number; education?: number } = {},
    payePercentage: number = 0
): SalaryBreakdown => {
    
    const housing = Number(allowances.housing) || 0;
    const transport = Number(allowances.transport) || 0;
    const lunch = Number(allowances.lunch) || 0;
    const wardrobe = Number(allowances.wardrobe) || 0;
    const education = Number(allowances.education) || 0;

    const totalAllowances = housing + transport + lunch + wardrobe + education;
    const gross = baseSalary + totalAllowances;
    
    // Pension = 8% of (Basic + Transport + Housing)
    const pension = Math.round(0.08 * (baseSalary + transport + housing));
    
    // PAYE = X% of (Basic + All Allowances - Pension)
    const taxableIncome = Math.max(0, gross - pension);
    const paye = Math.round((payePercentage / 100) * taxableIncome);

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
