import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ExpenseItem } from '../../../domain/entities/ExpenseItem';

/**
 * @class AddItemToExpenseUseCase
 * Caso de uso responsável por adicionar itens a uma despesa.
 */
export class AddItemToExpenseUseCase {
    /**
     * Construtor do AddItemToExpenseUseCase.
     * @param expenseRepository Repositório de despesas.
     */
    constructor(private expenseRepository: IExpenseRepository) { }

    /**
     * Adiciona um item a uma despesa existente.
     * @param expenseId ID da despesa.
     * @param item Objeto do item a ser adicionado.
     * @returns Uma promessa vazia.
     */
    async execute(expenseId: string, item: ExpenseItem): Promise<void> {
        return this.expenseRepository.addItemToExpense(expenseId, item);
    }
}
