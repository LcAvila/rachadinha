import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ExpenseItem } from '../../../domain/entities/ExpenseItem';

export class AddItemToExpenseUseCase {
    constructor(private expenseRepository: IExpenseRepository) { }

    async execute(expenseId: string, item: ExpenseItem): Promise<void> {
        return this.expenseRepository.addItemToExpense(expenseId, item);
    }
}
