import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { db } from './config';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { Notification } from '../../domain/entities/Notification';

export class NotificationRepository implements INotificationRepository {
    private collectionName = 'notifications';

    async registerForPushNotifications(): Promise<string | null> {
        let token: string | undefined;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            token = tokenData.data;
        } catch (e) {
            console.error("Error fetching push token", e);
            return null;
        }

        return token || null;
    }

    async sendPushNotification(pushToken: string, title: string, body: string, data?: any): Promise<void> {
        const message = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }

    async sendMultiplePushNotifications(
        notifications: Array<{ pushToken: string; title: string; body: string; data?: any; }>
    ): Promise<void> {
        const messages = notifications.map(n => ({
            to: n.pushToken,
            sound: 'default',
            title: n.title,
            body: n.body,
            data: n.data || {},
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });
    }

    // New methods for in-app notifications
    async getUserNotifications(userId: string): Promise<Notification[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                title: data.title,
                message: data.message,
                read: data.read,
                type: data.type,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                data: data.data
            };
        });
    }

    async markAsRead(notificationId: string): Promise<void> {
        const docRef = doc(db, this.collectionName, notificationId);
        await updateDoc(docRef, { read: true });
    }

    async createNotification(notification: Omit<Notification, 'id'>): Promise<void> {
        await addDoc(collection(db, this.collectionName), {
            ...notification,
            createdAt: Timestamp.fromDate(notification.createdAt),
        });
    }
}
