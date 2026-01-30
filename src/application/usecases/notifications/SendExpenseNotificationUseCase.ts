import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

/**
 * @class SendExpenseNotificationUseCase
 * Caso de uso responsável pelo envio de notificações push relacionadas a despesas.
 */
export class SendExpenseNotificationUseCase {
    /**
     * Construtor do SendExpenseNotificationUseCase.
     * @param notificationRepository Repositório de notificações.
     */
    constructor(private notificationRepository: INotificationRepository) { }

    /**
     * Envia uma notificação push.
     * @param pushToken Token do destinatário.
     * @param title Título da notificação.
     * @param body Mensagem da notificação.
     * @param data Dados extras opcionais.
     * @returns Uma promessa vazia.
     */
    async execute(pushToken: string, title: string, body: string, data?: any): Promise<void> {
        return this.notificationRepository.sendPushNotification(pushToken, title, body, data);
    }
}
