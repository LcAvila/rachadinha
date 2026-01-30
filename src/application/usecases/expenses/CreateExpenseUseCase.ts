import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { Expense } from '../../../domain/entities/Expense';

/**
 * @class CreateExpenseUseCase
 * Caso de uso responsável por criar uma nova despesa no sistema.
 */
export class CreateExpenseUseCase {
    /**
     * Construtor do CreateExpenseUseCase.
     * @param expenseRepository Repositório de despesas.
     */
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Cria uma nova despesa com status de rascunho (draft).
     * @param expenseData Dados iniciais da despesa (exceto campos gerados automaticamente como ID e datas).
     * @returns Uma promessa que resolve com a despesa criada.
     */
    async execute(
        expenseData: Omit<Expense, 'id' | 'createdAt' | 'status' | 'items' | 'finalizedAt'>
    ): Promise<Expense> {
        // Prepara objeto da nova despesa com valores padrão
        const newExpense: Omit<Expense, 'id'> = {
            ...expenseData,
            status: 'draft',
            items: [],
            createdAt: new Date(),
        };
        // Persiste a nova despesa
        return this.expenseRepository.createExpense(newExpense);
    }
}
