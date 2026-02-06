import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    arrayUnion,
    Timestamp,
    orderBy,
    increment,
    deleteDoc,
    writeBatch,
    arrayRemove
} from 'firebase/firestore';
import { db } from './config';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseItem } from '../../domain/entities/ExpenseItem';
import { PendingPayment, PaymentStatus } from '../../domain/entities/PendingPayment';
import { ExpenseParticipant, ParticipantStatus } from '../../domain/entities/ExpenseParticipant';
import { User } from '../../domain/entities/User';
import { FIREBASE_COLLECTIONS } from '../../core/constants/constants';

/**
 * @class ExpenseRepository
 * Repositório para gerenciar despesas, itens e pagamentos no Firestore.
 */
export class ExpenseRepository implements IExpenseRepository {

    /**
     * Cria uma nova despesa.
     * @param expense Dados da despesa.
     * @returns Despesa criada com ID.
     */
    async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
        const expenseToSave = {
            ...expense,
            // Preenche involvedUserIds com os criadores e envolvidos, removendo duplicatas
            involvedUserIds: expense.involvedUserIds.length > 0
                ? Array.from(new Set([...expense.involvedUserIds, expense.createdBy]))
                : [expense.createdBy]
        };

        // Remove valores undefined para evitar erros no Firestore
        const cleanExpense = JSON.parse(JSON.stringify(expenseToSave));

        // Adiciona ao Firestore
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.EXPENSES), cleanExpense);
        return { ...expenseToSave, id: docRef.id };
    }

    /**
     * Busca uma despesa pelo ID.
     */
    async getExpense(id: string): Promise<Expense | null> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Converte timestamps
            return {
                id: docSnap.id,
                ...data,
                items: data.items || [],
                involvedUserIds: data.involvedUserIds || [],
                participants: data.participants || [],
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                finalizedAt: data.finalizedAt instanceof Timestamp ? data.finalizedAt.toDate() : data.finalizedAt ? new Date(data.finalizedAt) : undefined
            } as Expense;
        }
        return null;
    }

    /**
     * Atualiza dados de uma despesa.
     */
    async updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, id);
        await updateDoc(docRef, expense);
    }

    /**
     * Adiciona um item unitário à despesa e atualiza totais.
     * @param expenseId ID da despesa.
     * @param item Item a adicionar.
     */
    async addItemToExpense(expenseId: string, item: ExpenseItem): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);

        // Extrai todos os IDs de usuários envolvidos no item
        // Fallback para item.userId para compatibilidade retroativa
        const newInvolvedIds = item.assignedTo
            ? item.assignedTo.map(u => u.userId)
            : (item.userId ? [item.userId] : []);

        if (newInvolvedIds.length > 0) {
            // Atualiza atomicamente arrays e incrementa o total
            await updateDoc(docRef, {
                items: arrayUnion(item), // Adiciona item ao array
                involvedUserIds: arrayUnion(...newInvolvedIds), // Adiciona novos IDs aos envolvidos (sem duplicar)
                totalAmount: increment(item.amount) // Incrementa o valor total no servidor
            });
        }
    }

    /**
     * Remove um item da despesa e atualiza totais.
     * @param expenseId ID da despesa.
     * @param itemIndex Índice do item a remover.
     */
    async deleteExpenseItem(expenseId: string, itemIndex: number): Promise<void> {
        const expense = await this.getExpense(expenseId);
        if (!expense) throw new Error('Despesa não encontrada');

        const itemToRemove = expense.items[itemIndex];
        if (!itemToRemove) throw new Error('Item não encontrado');

        // Remove o item do array
        const updatedItems = expense.items.filter((_, index) => index !== itemIndex);

        // Recalcula involvedUserIds
        const involvedIds = new Set<string>([expense.createdBy]);
        updatedItems.forEach(item => {
            item.assignedTo?.forEach(user => involvedIds.add(user.userId));
        });

        // Recalcula total
        const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await updateDoc(docRef, {
            items: updatedItems,
            involvedUserIds: Array.from(involvedIds),
            totalAmount: newTotal + expense.deliveryFee + expense.serviceFee - expense.discount
        });
    }

    /**
     * Atualiza o status de aceitação de um participante.
     * @param expenseId ID da despesa.
     * @param userId ID do usuário participante.
     * @param status Novo status.
     */
    async updateExpenseParticipantStatus(
        expenseId: string,
        userId: string,
        status: ParticipantStatus
    ): Promise<void> {
        const expense = await this.getExpense(expenseId);
        if (!expense) throw new Error('Despesa não encontrada');

        const participants = expense.participants || [];
        const participantIndex = participants.findIndex(p => p.userId === userId);

        if (participantIndex === -1) {
            throw new Error('Participante não encontrado');
        }

        const updatedParticipant: ExpenseParticipant = {
            ...participants[participantIndex],
            status,
            acceptedAt: status === 'accepted' ? new Date() : undefined,
            rejectedAt: status === 'rejected' ? new Date() : undefined
        };

        participants[participantIndex] = updatedParticipant;

        // Se rejeitado, remove dos involvedUserIds
        let involvedUserIds = expense.involvedUserIds;
        if (status === 'rejected') {
            involvedUserIds = involvedUserIds.filter(id => id !== userId);
        }

        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await updateDoc(docRef, {
            participants,
            involvedUserIds
        });
    }

    /**
     * Marca a despesa como finalizada e define a data de finalização.
     */
    async finalizeExpense(expenseId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await updateDoc(docRef, {
            status: 'waiting_payment',
            finalizedAt: new Date()
        });
    }

    /**
     * Busca despesas relacionadas a um usuário (criadas por ele ou onde ele está envolvido).
     */
    async getUserExpenses(userId: string): Promise<Expense[]> {
        // Query simples: involvedUserIds contém o usuário
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.EXPENSES),
            where('involvedUserIds', 'array-contains', userId)
        );

        const querySnapshot = await getDocs(q);
        const expenses = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                items: data.items || [],
                participants: data.participants || [],
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                finalizedAt: data.finalizedAt instanceof Timestamp ? data.finalizedAt.toDate() : undefined
            } as Expense;
        });

        // Ordenação no cliente para evitar necessidade de índices compostos complexos no Firestore por enquanto
        return expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    /**
     * Deleta uma despesa.
     */
    async deleteExpense(expenseId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await deleteDoc(docRef);
    }

    /**
     * Cria registro de pagamento pendente.
     */
    async createPendingPayment(payment: Omit<PendingPayment, 'id'>): Promise<PendingPayment> {
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS), payment);
        return { ...payment, id: docRef.id };
    }

    /**
     * Busca pagamentos pendentes divididos em "A Receber" e "A Pagar".
     */
    async getPendingPaymentsForUser(userId: string): Promise<{ toReceive: PendingPayment[]; toPay: PendingPayment[] }> {
        // Busca o que o usuário tem a receber
        const toReceiveQuery = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('toUserId', '==', userId),
            where('paymentStatus', '==', 'pending')
        );

        // Busca o que o usuário tem a pagar
        const toPayQuery = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('fromUserId', '==', userId),
            where('paymentStatus', '==', 'pending')
        );

        // Executa em paralelo
        const [toReceiveSnap, toPaySnap] = await Promise.all([
            getDocs(toReceiveQuery),
            getDocs(toPayQuery)
        ]);

        const toReceive = toReceiveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment));
        const toPay = toPaySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment));

        return { toReceive, toPay };
    }

    /**
     * Marca um pagamento como realizado.
     * @deprecated Use updatePendingPaymentStatus instead
     */
    async markPaymentAsPaid(paymentId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS, paymentId);
        await updateDoc(docRef, {
            paid: true,
            paymentStatus: 'paid',
            paidAt: new Date()
        });
    }

    /**
     * Atualiza o status de um pagamento pendente.
     * @param paymentId ID do pagamento.
     * @param status Novo status.
     * @param markedBy ID do usuário que marcou.
     */
    async updatePendingPaymentStatus(
        paymentId: string,
        status: PaymentStatus,
        markedBy: string
    ): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS, paymentId);
        await updateDoc(docRef, {
            paymentStatus: status,
            paid: status === 'paid',
            markedPaidBy: markedBy,
            paidAt: status === 'paid' ? new Date() : null
        });
    }

    /**
     * Verifica se todos os pagamentos de uma despesa foram pagos.
     * @param expenseId ID da despesa.
     * @returns true se todos os pagamentos foram pagos.
     */
    async checkAllPaymentsPaid(expenseId: string): Promise<boolean> {
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('expenseId', '==', expenseId)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return false;

        return snapshot.docs.every(doc => {
            const data = doc.data();
            return data.paymentStatus === 'paid' || data.paid === true;
        });
    }

    /**
     * Exclui todos os pagamentos pendentes de uma despesa (ex: ao reabrir a despesa).
     * Usa Batch para deleção em lote.
     */
    async deletePendingPaymentsByExpenseId(expenseId: string): Promise<void> {
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('expenseId', '==', expenseId)
        );
        const snapshot = await getDocs(q);

        // Inicia batch de escrita
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref)); // Agenda deleções

        // Comita as alterações
        await batch.commit();
    }

    /**
     * Busca todos os usuários do sistema.
     * Método auxiliar.
     */
    async getAllUsers(): Promise<User[]> {
        const querySnapshot = await getDocs(collection(db, FIREBASE_COLLECTIONS.USERS));
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                pushToken: data.pushToken,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
            } as User;
        });
    }
}
