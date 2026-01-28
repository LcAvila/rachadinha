import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { Expense } from '../../../domain/entities/Expense';

export type Period = 'week' | 'month' | 'year';

export interface PersonBalance {
    userId: string;
    userName: string;
    amount: number;
}

export interface FinancialStats {
    totalSpent: number;
    rachadinhaTotal: number;
    topItems: { name: string; amount: number; count: number }[];
    chartData: { label: string; value: number }[];
    toReceiveByPerson: PersonBalance[];
    toPayByPerson: PersonBalance[];
}

export class GetFinancialStatsUseCase {
    constructor(private expenseRepo: IExpenseRepository) { }

    async execute(userId: string, period: Period): Promise<FinancialStats> {
        const expenses = await this.expenseRepo.getUserExpenses(userId);
        const { toReceive, toPay } = await this.expenseRepo.getPendingPaymentsForUser(userId);

        const now = new Date();
        const filteredExpenses = expenses.filter((expense: Expense) => {
            const date = expense.createdAt;
            if (period === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            } else if (period === 'month') {
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            } else {
                return date.getFullYear() === now.getFullYear();
            }
        });

        const totalSpent = filteredExpenses.reduce((acc: number, curr: Expense) => {
            return acc + (curr.totalAmount || 0);
        }, 0);

        const rachadinhaTotal = filteredExpenses.length;

        // Group items
        const itemMap = new Map<string, { amount: number; count: number }>();

        filteredExpenses.forEach((expense: Expense) => {
            if (expense.items) {
                expense.items.forEach(item => {
                    const name = item.description.trim();
                    const current = itemMap.get(name) || { amount: 0, count: 0 };
                    itemMap.set(name, {
                        amount: current.amount + item.amount,
                        count: current.count + 1
                    });
                });
            }
        });

        const topItems = Array.from(itemMap.entries())
            .map(([name, val]) => ({ name, ...val }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Aggregate receivables by person
        const receiveMap = new Map<string, { name: string; amount: number }>();
        toReceive.filter(p => !p.paid).forEach(p => {
            const current = receiveMap.get(p.fromUserId) || { name: p.fromUserName, amount: 0 };
            receiveMap.set(p.fromUserId, { ...current, amount: current.amount + p.amount });
        });

        // Aggregate payables by person
        const payMap = new Map<string, { name: string; amount: number }>();
        toPay.filter(p => !p.paid).forEach(p => {
            const current = payMap.get(p.toUserId) || { name: p.toUserName, amount: 0 };
            payMap.set(p.toUserId, { ...current, amount: current.amount + p.amount });
        });

        const toReceiveByPerson = Array.from(receiveMap.entries()).map(([id, val]) => ({
            userId: id,
            userName: val.name,
            amount: val.amount
        }));

        const toPayByPerson = Array.from(payMap.entries()).map(([id, val]) => ({
            userId: id,
            userName: val.name,
            amount: val.amount
        }));

        // Chart Data
        const chartData = this.generateChartData(filteredExpenses, period);

        return {
            totalSpent,
            rachadinhaTotal,
            topItems,
            chartData,
            toReceiveByPerson,
            toPayByPerson
        };
    }

    private generateChartData(expenses: Expense[], period: Period): { label: string; value: number }[] {
        const map = new Map<string, number>();

        expenses.forEach(e => {
            let key = '';
            const date = e.createdAt;
            if (period === 'week') {
                key = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            } else if (period === 'month') {
                key = date.getDate().toString();
            } else {
                key = date.toLocaleDateString('pt-BR', { month: 'short' });
            }

            map.set(key, (map.get(key) || 0) + (e.totalAmount || 0));
        });

        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }
}

