import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { PendingPayment } from '../../../domain/entities/PendingPayment';

/**
 * @class GetPendingExpensesUseCase
 * Caso de uso responsável por obter os pagamentos pendentes de um usuário.
 */
export class GetPendingExpensesUseCase {
    /**
     * Construtor do GetPendingExpensesUseCase.
     * @param expenseRepository Repositório de despesas.
     */
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Recupera os pagamentos pendentes (a receber e a pagar) de um usuário.
     * @param userId ID do usuário.
     * @returns Uma promessa com objeto contendo listas de toReceive e toPay.
     */
    async execute(userId: string): Promise<{ toReceive: PendingPayment[]; toPay: PendingPayment[] }> {
        return this.expenseRepository.getPendingPaymentsForUser(userId);
    }
}
