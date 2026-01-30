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

/**
 * @class GroupRepository
 * Implementação do repositório de grupos utilizando o Firebase Firestore.
 */
export class GroupRepository implements IGroupRepository {
    /**
     * Cria um novo grupo no Firestore.
     * @param group Objeto do grupo a ser criado.
     * @returns Uma promessa com o grupo criado incluindo o ID gerado pelo Firestore.
     */
    async createGroup(group: Omit<Group, 'id'>): Promise<Group> {
        // Adiciona um novo documento à coleção de grupos
        const docRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.GROUPS), group);
        // Retorna o objeto combinando os dados originais com o ID gerado
        return { ...group, id: docRef.id };
    }

    /**
     * Busca os grupos onde o usuário é membro.
     * @param userId ID do usuário.
     * @returns Uma lista de grupos encontrados.
     */
    async getUserGroups(userId: string): Promise<Group[]> {
        // Cria uma query para buscar grupos onde o array 'members' contém o userId
        const q = query(
            collection(db, FIREBASE_COLLECTIONS.GROUPS),
            where('members', 'array-contains', userId)
        );

        // Executa a query
        const querySnapshot = await getDocs(q);

        // Mapeia os documentos retornados para o formato da entidade Group
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Converte Timestamp do Firestore para Date do JS
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
            } as Group;
        });
    }

    /**
     * Busca os detalhes de um grupo pelo ID.
     * @param groupId ID do grupo.
     * @returns O grupo encontrado ou null se não existir.
     */
    async getGroupDetails(groupId: string): Promise<Group | null> {
        // Referência para o documento específico
        const docRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                // Conversão de data
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Group;
        }
        return null;
    }

    /**
     * Adiciona um novo membro a um grupo existente.
     * @param groupId ID do grupo.
     * @param userId ID do usuário a adicionar.
     * @returns Uma promessa vazia.
     */
    async addMemberToGroup(groupId: string, userId: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.GROUPS, groupId);

        // Atualiza o documento adicionando o userId ao array 'members' usando operação atômica
        await updateDoc(docRef, {
            members: arrayUnion(userId)
        });
    }
}
