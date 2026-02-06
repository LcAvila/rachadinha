import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';

/**
 * @class DeleteExpenseUseCase
 * Caso de uso para deletar uma despesa completa.
 * Valida se o usuário é o criador e deleta pagamentos pendentes associados.
 */
export class DeleteExpenseUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Executa a exclusão de uma despesa.
     * @param expenseId ID da despesa.
     * @param userId ID do usuário que está tentando deletar.
     * @throws Error se o usuário não for o criador ou se a despesa não for encontrada.
     */
    async execute(expenseId: string, userId: string): Promise<void> {
        // Busca a despesa
        const expense = await this.expenseRepository.getExpense(expenseId);

        if (!expense) {
            throw new Error('Despesa não encontrada');
        }

        // Valida se o usuário é o criador
        if (expense.createdBy !== userId) {
            throw new Error('Apenas o criador da despesa pode deletá-la');
        }

        // Deleta pagamentos pendentes associados (se houver)
        await this.expenseRepository.deletePendingPaymentsByExpenseId(expenseId);

        // Deleta a despesa
        await this.expenseRepository.deleteExpense(expenseId);
    }
}
