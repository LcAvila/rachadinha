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
    receiverId?: string; // ID of the user who receives the payment (defaults to createdBy)
    invoiceUrl?: string | null;
    finalizedAt?: Date;
    createdAt: Date;
    items: ExpenseItem[];
    involvedUserIds: string[];
}
