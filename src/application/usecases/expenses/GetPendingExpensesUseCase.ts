import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { PendingPayment } from '../../../domain/entities/PendingPayment';

export class GetPendingExpensesUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    async execute(userId: string): Promise<{ toReceive: PendingPayment[]; toPay: PendingPayment[] }> {
        return this.expenseRepository.getPendingPaymentsForUser(userId);
    }
}
