import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { Expense } from '../../../domain/entities/Expense';

export class CreateExpenseUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    async execute(
        expenseData: Omit<Expense, 'id' | 'createdAt' | 'status' | 'items' | 'finalizedAt'>
    ): Promise<Expense> {
        const newExpense: Omit<Expense, 'id'> = {
            ...expenseData,
            status: 'draft',
            items: [],
            createdAt: new Date(),
        };
        return this.expenseRepository.createExpense(newExpense);
    }
}
