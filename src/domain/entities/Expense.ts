import { ExpenseItem } from './ExpenseItem';
import { ExpenseParticipant } from './ExpenseParticipant';

/**
 * @type ExpenseStatus
 * Status possíveis para uma despesa.
 * - 'draft': Rascunho, ainda não finalizada.
 * - 'waiting_payment': Finalizada, aguardando pagamentos.
 * - 'paid': Todos os pagamentos foram realizados.
 */
export type ExpenseStatus = 'draft' | 'waiting_payment' | 'paid';

/**
 * @interface Expense
 * Representa um registro de despesa (ex: uma conta de restaurante).
 * Contém detalhes financeiros, itens e status.
 */
export interface Expense {
    /**
     * Identificador único da despesa.
     */
    id: string;

    /**
     * ID do usuário que criou a despesa.
     */
    createdBy: string;

    /**
     * Nome do usuário que criou a despesa (para exibição rápida).
     */
    createdByName: string;

    /**
     * Título ou descrição da despesa.
     */
    title: string;

    /**
     * Valor total da despesa, incluindo taxas e descontos.
     */
    totalAmount: number;

    /**
     * Taxa de entrega.
     */
    deliveryFee: number;

    /**
     * Taxa de serviço (ex: 10%).
     */
    serviceFee: number;

    /**
     * Valor do desconto aplicado.
     */
    discount: number;

    /**
     * Status atual da despesa.
     */
    status: ExpenseStatus;

    /**
     * ID do usuário que recebe o pagamento (padrão é o createdBy).
     * @optional
     */
    receiverId?: string;

    /**
     * URL da imagem ou documento da fatura/comprovante.
     * @optional
     */
    invoiceUrl?: string | null;

    /**
     * Data em que a despesa foi finalizada.
     * @optional
     */
    finalizedAt?: Date;

    /**
     * Data de criação do registro.
     */
    createdAt: Date;

    /**
     * Lista de itens que compõem a despesa.
     */
    items: ExpenseItem[];

    /**
     * Lista de IDs dos usuários envolvidos na despesa.
     */
    involvedUserIds: string[];

    /**
     * Lista de participantes e seus status de aceitação.
     * @optional
     */
    participants?: ExpenseParticipant[];
}
