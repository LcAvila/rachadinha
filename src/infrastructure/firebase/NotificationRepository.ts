import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { db } from './config';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { Notification } from '../../domain/entities/Notification';

/**
 * @class NotificationRepository
 * Implementação do repositório de notificações.
 * Gerencia tanto notificações push (via Expo) quanto notificações internas (via Firestore).
 */
export class NotificationRepository implements INotificationRepository {
    // Nome da coleção no Firestore
    private collectionName = 'notifications';

    /**
     * Solicita permissão e registra o dispositivo para receber notificações push.
     * Configura canais específicos para Android.
     * @returns Uma promessa com o token do Expo Push Notification ou null em caso de falha.
     */
    async registerForPushNotifications(): Promise<string | null> {
        let token: string | undefined;

        // Configuração específica para Android (Canais de Notificação)
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        // Verifica permissões existentes
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Se não tiver permissão, solicita ao usuário
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        // Se permissão negada, encerra
        if (finalStatus !== 'granted') {
            console.log('Falha ao obter token para notificação push!');
            return null;
        }

        // Obtém o token do Expo
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            token = tokenData.data;
        } catch (e) {
            console.error("Erro ao buscar push token", e);
            return null;
        }

        return token || null;
    }

    /**
     * Envia uma notificação push individual através da API do Expo.
     * @param pushToken Token do dispositivo de destino.
     * @param title Título da notificação.
     * @param body Corpo da mensagem.
     * @param data Objeto de dados opcional (payload).
     * @returns Uma promessa vazia.
     */
    async sendPushNotification(pushToken: string, title: string, body: string, data?: any): Promise<void> {
        const message = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        // Chama a API de Push do Expo via fetch
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

    /**
     * Envia múltiplas notificações push em lote (batch).
     * Útil para notificar vários usuários simultaneamente.
     * @param notifications Array de objetos de notificação.
     * @returns Uma promessa vazia.
     */
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

    /**
     * Busca notificações armazenadas no Firestore para um usuário específico.
     * Ordena por data de criação (mais recentes primeiro).
     * @param userId ID do usuário.
     * @returns Lista de notificações internas.
     */
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
                // Converte Timestamp para Date
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                data: data.data
            };
        });
    }

    /**
     * Marca uma notificação específica como lida no banco de dados.
     * @param notificationId ID da notificação.
     * @returns Uma promessa vazia.
     */
    async markAsRead(notificationId: string): Promise<void> {
        const docRef = doc(db, this.collectionName, notificationId);
        await updateDoc(docRef, { read: true });
    }

    /**
     * Cria uma nova notificação persistente no Firestore.
     * @param notification Dados da notificação.
     * @returns Uma promessa vazia.
     */
    async createNotification(notification: Omit<Notification, 'id'>): Promise<void> {
        await addDoc(collection(db, this.collectionName), {
            ...notification,
            // Armazena a data como Timestamp do Firestore
            createdAt: Timestamp.fromDate(notification.createdAt),
        });
    }
}
