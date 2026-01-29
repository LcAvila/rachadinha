export interface ExpenseItem {
    userId?: string; // Deprecated, kept for backward compatibility
    userName?: string; // Deprecated

    assignedTo: { userId: string; userName: string }[];
    description: string;
    amount: number; // Total amount (unitPrice * quantity)
    quantity: number;
    unitPrice: number;
    notified: boolean;
}
