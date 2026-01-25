import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    arrayUnion,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { Group } from '../../domain/entities/Group';
import { FIREBASE_COLLECTIONS } from '../../core/constants/constants';

export class GroupRepository implements IGroupRepository {
    async createGroup(group: Omit<Group, 'id'>): Promise<Group> {
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.GROUPS), group);
        return { ...group, id: docRef.id };
    }

    async getUserGroups(userId: string): Promise<Group[]> {
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.GROUPS),
            where('members', 'array-contains', userId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
            } as Group;
        });
    }

    async getGroupDetails(groupId: string): Promise<Group | null> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Group;
        }
        return null;
    }

    async addMemberToGroup(groupId: string, userId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
        await updateDoc(docRef, {
            members: arrayUnion(userId)
        });
    }
}
