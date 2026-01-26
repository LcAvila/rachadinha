
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any; // For deep linking or extra info
}
