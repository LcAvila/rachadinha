import { ExpenseItem } from './ExpenseItem';

export type ExpenseStatus = 'draft' | 'waiting_payment' | 'paid';

export interface Expense {
    id: string;
    createdBy: string;
    createdByName: string;
    title: string;
    totalAmount: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    status: ExpenseStatus;
    invoiceUrl?: string;
    finalizedAt?: Date;
    createdAt: Date;
    items: ExpenseItem[];
    involvedUserIds: string[];
}
