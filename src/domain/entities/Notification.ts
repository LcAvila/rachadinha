/**
 * @interface Notification
 * Representa uma notificação do sistema para o usuário.
 * Pode ser do tipo info, sucesso, aviso ou erro.
 */
export interface Notification {
    /**
     * Identificador único da notificação.
     */
    id: string;

    /**
     * ID do usuário que receberá a notificação.
     */
    userId: string;

    /**
     * Título da notificação.
     */
    title: string;

    /**
     * Corpo da mensagem da notificação.
     */
    message: string;

    /**
     * Indica se a notificação já foi lida pelo usuário.
     */
    read: boolean;

    /**
     * Data de criação da notificação.
     */
    createdAt: Date;

    /**
     * Tipo da notificação (info, success, warning, error).
     */
    type: 'info' | 'success' | 'warning' | 'error';

    /**
     * Dados adicionais da notificação.
     * @optional
     * // Para deep linking ou informações extras
     */
    data?: any;
}
