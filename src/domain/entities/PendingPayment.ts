export interface PendingPayment {
    id: string;
    expenseId: string;
    expenseTitle: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    paid: boolean;
    paidAt?: Date;
    createdAt: Date;
}
