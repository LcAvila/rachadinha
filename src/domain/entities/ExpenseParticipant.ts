/**
 * @type ParticipantStatus
 * Status possíveis para um participante de uma despesa.
 * - 'pending': Aguardando aceitação do participante.
 * - 'accepted': Participante aceitou a despesa.
 * - 'rejected': Participante rejeitou a despesa.
 */
export type ParticipantStatus = 'pending' | 'accepted' | 'rejected';

/**
 * @interface ExpenseParticipant
 * Representa a participação de um usuário em uma despesa.
 * Rastreia se o participante aceitou ou rejeitou a despesa.
 */
export interface ExpenseParticipant {
    /**
     * ID do usuário participante.
     */
    userId: string;

    /**
     * Nome do usuário participante (para exibição rápida).
     */
    userName: string;

    /**
     * Status de aceitação do participante.
     */
    status: ParticipantStatus;

    /**
     * Data em que o participante aceitou a despesa.
     * @optional
     */
    acceptedAt?: Date;

    /**
     * Data em que o participante rejeitou a despesa.
     * @optional
     */
    rejectedAt?: Date;
}
