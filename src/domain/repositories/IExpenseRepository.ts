import { Expense } from '../entities/Expense';
import { ExpenseItem } from '../entities/ExpenseItem';
import { PendingPayment } from '../entities/PendingPayment';
import { User } from '../entities/User';

export interface IExpenseRepository {
    createExpense(expense: Omit<Expense, 'id'>): Promise<Expense>;
    getExpense(id: string): Promise<Expense | null>;
    updateExpense(id: string, expense: Partial<Expense>): Promise<void>;
    addItemToExpense(expenseId: string, item: ExpenseItem): Promise<void>;
    finalizeExpense(expenseId: string): Promise<void>;
    getUserExpenses(userId: string): Promise<Expense[]>;
    deleteExpense(expenseId: string): Promise<void>;

    createPendingPayment(payment: Omit<PendingPayment, 'id'>): Promise<PendingPayment>;
    getPendingPaymentsForUser(userId: string): Promise<{
        toReceive: PendingPayment[];
        toPay: PendingPayment[];
    }>;
    markPaymentAsPaid(paymentId: string): Promise<void>;
    deletePendingPaymentsByExpenseId(expenseId: string): Promise<void>;

    getAllUsers(): Promise<User[]>;
}
