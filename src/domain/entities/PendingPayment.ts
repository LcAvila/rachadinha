/**
 * @type PaymentStatus
 * Status possíveis para um pagamento pendente.
 * - 'pending': Aguardando pagamento.
 * - 'paid': Pagamento realizado.
 */
export type PaymentStatus = 'pending' | 'paid';

/**
 * @interface PendingPayment
 * Representa um pagamento pendente entre dois usuários.
 * Gerado a partir das divisões de despesas.
 */
export interface PendingPayment {
    /**
     * Identificador único do pagamento pendente.
     */
    id: string;

    /**
     * ID da despesa que gerou este pagamento.
     */
    expenseId: string;

    /**
     * Título da despesa para referência rápida.
     */
    expenseTitle: string;

    /**
     * ID do usuário que deve pagar.
     */
    fromUserId: string;

    /**
     * Nome do usuário que deve pagar.
     */
    fromUserName: string;

    /**
     * ID do usuário que deve receber.
     */
    toUserId: string;

    /**
     * Nome do usuário que deve receber.
     */
    toUserName: string;

    /**
     * Valor a ser pago.
     */
    amount: number;

    /**
     * Indica se o pagamento já foi realizado/confirmado.
     * @deprecated Use paymentStatus instead
     */
    paid: boolean;

    /**
     * Status do pagamento.
     */
    paymentStatus: PaymentStatus;

    /**
     * ID do usuário que marcou o pagamento como pago.
     * @optional
     */
    markedPaidBy?: string;

    /**
     * Data em que o pagamento foi realizado.
     * @optional
     */
    paidAt?: Date;

    /**
     * Data de criação do registro de pagamento pendente.
     */
    createdAt: Date;
}
