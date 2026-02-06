import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { PaymentStatus } from '../../../domain/entities/PendingPayment';

/**
 * @class UpdatePaymentStatusUseCase
 * Caso de uso para atualizar o status de um pagamento pendente.
 * Verifica se todos os pagamentos foram pagos e atualiza o status da despesa para 'paid' se necessário.
 */
export class UpdatePaymentStatusUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Executa a atualização do status de pagamento.
     * @param paymentId ID do pagamento.
     * @param status Novo status.
     * @param userId ID do usuário que está marcando.
     * @throws Error se o pagamento não for encontrado.
     */
    async execute(paymentId: string, status: PaymentStatus, userId: string): Promise<void> {
        // Atualiza o status do pagamento
        await this.expenseRepository.updatePendingPaymentStatus(paymentId, status, userId);

        // Busca o pagamento para obter o expenseId
        // Nota: Precisaríamos adicionar um método getPendingPayment no repositório
        // Por enquanto, vamos assumir que o expenseId é passado ou obtido de outra forma
        // TODO: Implementar lógica para verificar se todos os pagamentos foram pagos
        // e atualizar o status da despesa para 'paid' se necessário
    }

    /**
     * Verifica se todos os pagamentos de uma despesa foram pagos e atualiza o status.
     * @param expenseId ID da despesa.
     */
    async checkAndUpdateExpenseStatus(expenseId: string): Promise<void> {
        const allPaid = await this.expenseRepository.checkAllPaymentsPaid(expenseId);

        if (allPaid) {
            await this.expenseRepository.updateExpense(expenseId, {
                status: 'paid'
            });
        }
    }
}
