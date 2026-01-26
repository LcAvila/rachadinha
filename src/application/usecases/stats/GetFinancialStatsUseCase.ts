
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense } from '../../domain/entities/Expense';

export type Period = 'week' | 'month' | 'year';

export interface FinancialStats {
    totalSpent: number;
    rachadinhaTotal: number;
    topItems: { name: string; amount: number; count: number }[];
    chartData: { label: string; value: number }[];
}

export class GetFinancialStatsUseCase {
    constructor(private expenseRepo: IExpenseRepository) { }

    async execute(userId: string, period: Period): Promise<FinancialStats> {
        const expenses = await this.expenseRepo.getUserExpenses(userId);

        const now = new Date();
        const filteredExpenses = expenses.filter(expense => {
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

        const totalSpent = filteredExpenses.reduce((acc, curr) => {
            // Only count if user is paying (simplified assumption: creator pays upfront)
            // Ideally we check split, but for personal finance view:
            return acc + (curr.totalAmount || 0); // Total bill value
        }, 0);

        // Calculate "Rachadinha" part (what others owe me)
        // Simplified: Assumes even split for now or we could fetch PendingPayments.
        // Let's rely on expense totals first. 
        // If I paid 100 and split with 1 person, 50 is my expense, 50 is rachadinha.
        // For now, let's just show Total Bill Volume vs Number of Rachadinhas.
        const rachadinhaTotal = filteredExpenses.length;

        // Group items
        const itemMap = new Map<string, { amount: number; count: number }>();

        filteredExpenses.forEach(expense => {
            if (expense.items) {
                expense.items.forEach(item => {
                    const name = item.description.trim(); // Case sensitive for now, maybe normalize lower
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

        // Chart Data
        const chartData = this.generateChartData(filteredExpenses, period);

        return {
            totalSpent,
            rachadinhaTotal,
            topItems,
            chartData
        };
    }

    private generateChartData(expenses: Expense[], period: Period): { label: string; value: number }[] {
        // Implementation for grouping by day/month for chart
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

            map.set(key, (map.get(key) || 0) + e.totalAmount);
        });

        // Fill missing labels ideally, but simple ver:
        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }
}
