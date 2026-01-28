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
    writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseItem } from '../../domain/entities/ExpenseItem';
import { PendingPayment } from '../../domain/entities/PendingPayment';
import { User } from '../../domain/entities/User';
import { FIREBASE_COLLECTIONS } from '../../core/constants/constants';

export class ExpenseRepository implements IExpenseRepository {
    async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
        const expenseToSave = {
            ...expense,
            involvedUserIds: expense.involvedUserIds.length > 0
                ? Array.from(new Set([...expense.involvedUserIds, expense.createdBy]))
                : [expense.createdBy]
        };
        // Filter out undefined values as Firestore doesn't support them
        const cleanExpense = JSON.parse(JSON.stringify(expenseToSave));
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.EXPENSES), cleanExpense);
        return { ...expenseToSave, id: docRef.id };
    }

    async getExpense(id: string): Promise<Expense | null> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Firestore Timestamps to Dates if necessary
            return {
                id: docSnap.id,
                ...data,
                items: data.items || [],
                involvedUserIds: data.involvedUserIds || [],
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                finalizedAt: data.finalizedAt instanceof Timestamp ? data.finalizedAt.toDate() : data.finalizedAt ? new Date(data.finalizedAt) : undefined
            } as Expense;
        }
        return null;
    }

    async updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, id);
        await updateDoc(docRef, expense);
    }

    async addItemToExpense(expenseId: string, item: ExpenseItem): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await updateDoc(docRef, {
            items: arrayUnion(item),
            involvedUserIds: arrayUnion(item.userId),
            totalAmount: increment(item.amount)
        });
    }

    async finalizeExpense(expenseId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await updateDoc(docRef, {
            status: 'waiting_payment',
            finalizedAt: new Date()
        });
    }

    async getUserExpenses(userId: string): Promise<Expense[]> {
        // Queries logic depends on requirements. Here fetching created by user or involved.
        // For MVP, lets simplistic approach: Expenses created by user.
        // Ideally we would query expenses where items array contains user, but Firestore complex query.
        // Let's implement fetching expenses created by the user for now.
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
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                finalizedAt: data.finalizedAt instanceof Timestamp ? data.finalizedAt.toDate() : undefined
            } as Expense;
        });

        // Client-side sorting to bypass index requirement
        return expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async deleteExpense(expenseId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.EXPENSES, expenseId);
        await deleteDoc(docRef);
    }

    async createPendingPayment(payment: Omit<PendingPayment, 'id'>): Promise<PendingPayment> {
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS), payment);
        return { ...payment, id: docRef.id };
    }

    async getPendingPaymentsForUser(userId: string): Promise<{ toReceive: PendingPayment[]; toPay: PendingPayment[] }> {
        const toReceiveQuery = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('toUserId', '==', userId),
            where('paid', '==', false)
        );

        const toPayQuery = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('fromUserId', '==', userId),
            where('paid', '==', false)
        );

        const [toReceiveSnap, toPaySnap] = await Promise.all([
            getDocs(toReceiveQuery),
            getDocs(toPayQuery)
        ]);

        const toReceive = toReceiveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment));
        const toPay = toPaySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment));

        return { toReceive, toPay };
    }

    async markPaymentAsPaid(paymentId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS, paymentId);
        await updateDoc(docRef, {
            paid: true,
            paidAt: new Date()
        });
    }

    async deletePendingPaymentsByExpenseId(expenseId: string): Promise<void> {
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.PENDING_PAYMENTS),
            where('expenseId', '==', expenseId)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }

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
