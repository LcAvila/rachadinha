import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

export class SendExpenseNotificationUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(pushToken: string, title: string, body: string, data?: any): Promise<void> {
        return this.notificationRepository.sendPushNotification(pushToken, title, body, data);
    }
}
