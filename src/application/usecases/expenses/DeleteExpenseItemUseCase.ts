import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';

/**
 * @class DeleteExpenseItemUseCase
 * Caso de uso para deletar um item de uma despesa.
 * Valida se o usuário é o criador antes de permitir a exclusão.
 */
export class DeleteExpenseItemUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Executa a exclusão de um item da despesa.
     * @param expenseId ID da despesa.
     * @param itemIndex Índice do item a remover.
     * @param userId ID do usuário que está tentando deletar.
     * @throws Error se o usuário não for o criador ou se a despesa não for encontrada.
     */
    async execute(expenseId: string, itemIndex: number, userId: string): Promise<void> {
        // Busca a despesa
        const expense = await this.expenseRepository.getExpense(expenseId);

        if (!expense) {
            throw new Error('Despesa não encontrada');
        }

        // Valida se o usuário é o criador
        if (expense.createdBy !== userId) {
            throw new Error('Apenas o criador da despesa pode deletar itens');
        }

        // Valida se a despesa está em rascunho
        if (expense.status !== 'draft') {
            throw new Error('Apenas despesas em rascunho podem ter itens deletados');
        }

        // Deleta o item
        await this.expenseRepository.deleteExpenseItem(expenseId, itemIndex);
    }
}
