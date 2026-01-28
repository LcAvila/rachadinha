import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { calculateProportionalAmounts } from '../../utils/CalculateProportionalAmounts';
import { PendingPayment } from '../../../domain/entities/PendingPayment';
import { formatCurrency } from '../../../core/utils/formatCurrency';

export class FinalizeExpenseUseCase {
    constructor(
        private expenseRepository: IExpenseRepository,
        private notificationRepository: INotificationRepository
    ) { }

    async execute(expenseId: string): Promise<void> {
        const expense = await this.expenseRepository.getExpense(expenseId);
        if (!expense) throw new Error('Despesa não encontrada');
        if (expense.status === 'paid') throw new Error('Despesa já paga e finalizada');

        // Se já estiver em aguardando, vamos limpar os pagamentos antigos para evitar duplicidade
        if (expense.status === 'waiting_payment') {
            await this.expenseRepository.deletePendingPaymentsByExpenseId(expenseId);
        }

        // 1. Calcular Rateio
        const calculations = calculateProportionalAmounts(
            expense.items,
            expense.deliveryFee,
            expense.serviceFee,
            expense.discount
        );

        // Buscar todos os usuários para pegar os tokens de notificação
        const allUsers = await this.expenseRepository.getAllUsers();

        const notificationsToSend: Array<{ pushToken: string; title: string; body: string; data?: any }> = [];

        // 2. Criar Pagamentos Pendentes e Preparar Notificações
        for (const calc of calculations) {
            // Pular o criador da despesa (assumindo que ele pagou e vai receber)
            if (calc.userId === expense.createdBy) continue;

            const payment: Omit<PendingPayment, 'id'> = {
                expenseId: expense.id,
                expenseTitle: expense.title,
                fromUserId: calc.userId,
                fromUserName: calc.userName,
                toUserId: expense.createdBy,
                toUserName: expense.createdByName,
                amount: calc.finalAmount,
                paid: false,
                createdAt: new Date(),
            };

            await this.expenseRepository.createPendingPayment(payment);

            // Preparar notificação
            const userToNotify = allUsers.find(u => u.id === calc.userId);

            // 2.1 Criar notificação persistente no app
            await this.notificationRepository.createNotification({
                userId: calc.userId,
                title: 'Nova Despesa Finalizada',
                message: `${expense.createdByName} incluiu você na despesa "${expense.title}". Valor: ${formatCurrency(calc.finalAmount)}.`,
                read: false,
                type: 'expense_invite', // or 'payment_request'
                createdAt: new Date(),
                data: { expenseId: expense.id }
            });

            // 2.2 Preparar Push Notification
            if (userToNotify?.pushToken) {
                notificationsToSend.push({
                    pushToken: userToNotify.pushToken,
                    title: 'Nova Despesa Finalizada',
                    body: `${expense.createdByName} incluiu você na despesa "${expense.title}". Você deve ${formatCurrency(calc.finalAmount)}.`,
                    data: { expenseId: expense.id, type: 'EXPENSE_FINALIZED' }
                });
            }
        }

        // 3. Enviar Notificações em Lote
        if (notificationsToSend.length > 0) {
            await this.notificationRepository.sendMultiplePushNotifications(notificationsToSend);
        }

        // 4. Marcar despesa como finalizada
        await this.expenseRepository.finalizeExpense(expenseId);
    }
}
