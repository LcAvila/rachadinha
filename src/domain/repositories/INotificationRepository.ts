export interface INotificationRepository {
    registerForPushNotifications(): Promise<string | null>;
    sendPushNotification(
        pushToken: string,
        title: string,
        body: string,
        data?: any
    ): Promise<void>;
    sendMultiplePushNotifications(
        notifications: Array<{
            pushToken: string;
            title: string;
            body: string;
            data?: any;
        }>
    ): Promise<void>;
}
