import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { Expense } from '../../../domain/entities/Expense';

/**
 * @type Period
 * Define o período de tempo para filtro das estatísticas.
 */
export type Period = 'week' | 'month' | 'year';

/**
 * @interface PersonBalance
 * Estrutura auxiliar para exibir o balanço por pessoa.
 */
export interface PersonBalance {
    userId: string;
    userName: string;
    amount: number;
}

/**
 * @interface FinancialStats
 * Agrupamento de todas as estatísticas financeiras retornadas para o usuário.
 */
export interface FinancialStats {
    totalSpent: number;
    rachadinhaTotal: number;
    topItems: { name: string; amount: number; count: number }[];
    chartData: { label: string; value: number }[];
    topReceivers: { name: string; amount: number; count: number }[];
    topPayers: { name: string; amount: number; count: number }[];
    toReceiveByPerson: PersonBalance[];
    toPayByPerson: PersonBalance[];
}

/**
 * @class GetFinancialStatsUseCase
 * Caso de uso responsável por calcular e agregar as estatísticas financeiras do usuário.
 */
export class GetFinancialStatsUseCase {
    /**
     * Construtor do GetFinancialStatsUseCase.
     * @param expenseRepo Repositório de despesas.
     */
    constructor(private expenseRepo: IExpenseRepository) { }

    /**
     * Executa o cálculo das estatísticas.
     * @param userId ID do usuário.
     * @param period Período a ser considerado (semana, mês, ano).
     * @returns Uma promessa que resolve com o objeto FinancialStats.
     */
    async execute(userId: string, period: Period): Promise<FinancialStats> {
        const expenses = await this.expenseRepo.getUserExpenses(userId);
        const { toReceive, toPay } = await this.expenseRepo.getPendingPaymentsForUser(userId);

        const now = new Date();

        // Filtra as despesas baseadas no período selecionado
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

        // Calcula o total gasto no período
        const totalSpent = filteredExpenses.reduce((acc: number, curr: Expense) => {
            return acc + (curr.totalAmount || 0);
        }, 0);

        const rachadinhaTotal = filteredExpenses.length;

        // Agrupar itens para "Maiores Gastos"
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

        // -- Abaixo seguimos com a lógica de pagamentos pendentes/ativos --
        // Utiliza toReceive e toPay para verificar quem deve ou tem a receber

        // Agregar "A Receber" por pessoa
        const receiveMapIter = new Map<string, { name: string; amount: number }>();
        toReceive.filter(p => !p.paid).forEach(p => {
            const current = receiveMapIter.get(p.fromUserId) || { name: p.fromUserName, amount: 0 };
            receiveMapIter.set(p.fromUserId, { ...current, amount: current.amount + p.amount });
        });

        // Agregar "A Pagar" por pessoa
        const payMapIter = new Map<string, { name: string; amount: number }>();
        toPay.filter(p => !p.paid).forEach(p => {
            const current = payMapIter.get(p.toUserId) || { name: p.toUserName, amount: 0 };
            payMapIter.set(p.toUserId, { ...current, amount: current.amount + p.amount });
        });

        // Transforma maps em arrays ordenados
        const toReceiveByPerson = Array.from(receiveMapIter.entries()).map(([id, val]) => ({
            userId: id,
            userName: val.name,
            amount: val.amount
        })).sort((a, b) => b.amount - a.amount);

        const toPayByPerson = Array.from(payMapIter.entries()).map(([id, val]) => ({
            userId: id,
            userName: val.name,
            amount: val.amount
        })).sort((a, b) => b.amount - a.amount);

        // Gera dados para o gráfico de evolução
        const chartData = this.generateChartData(filteredExpenses, period);

        return {
            totalSpent,
            rachadinhaTotal,
            topItems,
            chartData,
            toReceiveByPerson,
            toPayByPerson,
            topReceivers: [], // Placeholder se não tiver dados históricos
            topPayers: [] // Placeholder
        };
    }

    /**
     * Gera os dados formatados para o gráfico de linha.
     * @param expenses Lista de despesas filtradas.
     * @param period Período selecionado.
     * @returns Array de objetos com label e value.
     */
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
