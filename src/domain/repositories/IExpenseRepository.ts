import { Expense } from '../entities/Expense';
import { ExpenseItem } from '../entities/ExpenseItem';
import { PendingPayment } from '../entities/PendingPayment';
import { User } from '../entities/User';

/**
 * @interface IExpenseRepository
 * Interface que define os métodos para operações relacionadas a despesas e pagamentos pendentes.
 */
export interface IExpenseRepository {
    /**
     * Cria uma nova despesa.
     * @param expense Objeto de despesa sem o ID.
     * @returns Uma promessa com a despesa criada e seu ID gerado.
     */
    createExpense(expense: Omit<Expense, 'id'>): Promise<Expense>;

    /**
     * Obtém uma despesa pelo ID.
     * @param id ID da despesa.
     * @returns Uma promessa com a despesa encontrada ou null.
     */
    getExpense(id: string): Promise<Expense | null>;

    /**
     * Atualiza uma despesa existente.
     * @param id ID da despesa.
     * @param expense Dados parciais da despesa para atualização.
     * @returns Uma promessa vazia.
     */
    updateExpense(id: string, expense: Partial<Expense>): Promise<void>;

    /**
     * Adiciona um item a uma despesa existente.
     * @param expenseId ID da despesa.
     * @param item Item a ser adicionado.
     * @returns Uma promessa vazia.
     */
    addItemToExpense(expenseId: string, item: ExpenseItem): Promise<void>;

    /**
     * Finaliza uma despesa, alterando seu status e possivelmente gerando pagamentos pendentes.
     * @param expenseId ID da despesa.
     * @returns Uma promessa vazia.
     */
    finalizeExpense(expenseId: string): Promise<void>;

    /**
     * Obtém todas as despesas que um usuário criou ou nas quais está envolvido.
     * @param userId ID do usuário.
     * @returns Uma promessa com a lista de despesas.
     */
    getUserExpenses(userId: string): Promise<Expense[]>;

    /**
     * Exclui uma despesa.
     * @param expenseId ID da despesa.
     * @returns Uma promessa vazia.
     */
    deleteExpense(expenseId: string): Promise<void>;

    /**
     * Cria um pagamento pendente.
     * @param payment Objeto de pagamento pendente sem o ID.
     * @returns Uma promessa com o pagamento pendente criado.
     */
    createPendingPayment(payment: Omit<PendingPayment, 'id'>): Promise<PendingPayment>;

    /**
     * Obtém os pagamentos pendentes para um usuário, divididos entre "a receber" e "a pagar".
     * @param userId ID do usuário.
     * @returns Uma promessa com dois arrays: toReceive e toPay.
     */
    getPendingPaymentsForUser(userId: string): Promise<{
        toReceive: PendingPayment[];
        toPay: PendingPayment[];
    }>;

    /**
     * Marca um pagamento pendente como pago.
     * @param paymentId ID do pagamento.
     * @returns Uma promessa vazia.
     */
    markPaymentAsPaid(paymentId: string): Promise<void>;

    /**
     * Exclui todos os pagamentos pendentes associados a uma despesa.
     * @param expenseId ID da despesa.
     * @returns Uma promessa vazia.
     */
    deletePendingPaymentsByExpenseId(expenseId: string): Promise<void>;

    /**
     * Obtém todos os usuários para seleção (método auxiliar).
     * @returns Uma promessa com a lista de todos os usuários.
     */
    getAllUsers(): Promise<User[]>;
}
