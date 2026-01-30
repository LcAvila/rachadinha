/**
 * @interface ExpenseItem
 * Representa um item individual dentro de uma despesa.
 * Define quem consumiu o quê e quanto custou.
 */
export interface ExpenseItem {
    /**
     * ID do usuário associado ao item.
     * @deprecated Descontinuado, mantido para compatibilidade retroativa.
     * @optional
     */
    userId?: string;

    /**
     * Nome do usuário associado ao item.
     * @deprecated Descontinuado.
     * @optional
     */
    userName?: string;

    /**
     * Lista de usuários atribuídos a este item (divisão do item).
     * Cada objeto contém userId e userName.
     */
    assignedTo: { userId: string; userName: string }[];

    /**
     * Descrição do item (ex: "Pizza de Calabresa").
     */
    description: string;

    /**
     * Valor total do item (preço unitário * quantidade).
     */
    amount: number;

    /**
     * Quantidade do item.
     */
    quantity: number;

    /**
     * Preço unitário do item.
     */
    unitPrice: number;

    /**
     * Flag interna para controle de notificações.
     */
    notified: boolean;
}
