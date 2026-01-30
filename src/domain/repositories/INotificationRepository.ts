/**
 * @interface INotificationRepository
 * Interface que define os métodos para envio e gestão de notificações.
 */
export interface INotificationRepository {
    /**
     * Registra o dispositivo atual para receber notificações push.
     * @returns Uma promessa com o token gerado ou null.
     */
    registerForPushNotifications(): Promise<string | null>;

    /**
     * Envia uma notificação push para um único token (usuário).
     * @param pushToken Token do dispositivo destinatário.
     * @param title Título da notificação.
     * @param body Corpo da mensagem.
     * @param data Dados adicionais opcionais.
     * @returns Uma promessa vazia.
     */
    sendPushNotification(
        pushToken: string,
        title: string,
        body: string,
        data?: any
    ): Promise<void>;

    /**
     * Envia múltiplas notificações push em lote.
     * @param notifications Array de objetos contendo token, título, corpo e dados.
     * @returns Uma promessa vazia.
     */
    sendMultiplePushNotifications(
        notifications: Array<{
            pushToken: string;
            title: string;
            body: string;
            data?: any;
        }>
    ): Promise<void>;

    /**
     * Obtém a lista de notificações armazenadas para um usuário.
     * @param userId ID do usuário.
     * @returns Uma promessa com a lista de notificações.
     */
    getUserNotifications(userId: string): Promise<any[]>;

    /**
     * Marca uma notificação como lida.
     * @param notificationId ID da notificação.
     * @returns Uma promessa vazia.
     */
    markAsRead(notificationId: string): Promise<void>;

    /**
     * Cria e armazena uma notificação no banco de dados.
     * @param notification Objeto da notificação.
     * @returns Uma promessa vazia.
     */
    createNotification(notification: any): Promise<void>;
}
