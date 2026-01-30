import { Group } from '../../domain/entities/Group';

/**
 * @interface IGroupRepository
 * Interface que define os métodos para operações relacionadas a grupos de usuários.
 */
export interface IGroupRepository {
    /**
     * Cria um novo grupo.
     * @param group Objeto de grupo sem o ID.
     * @returns Uma promessa com o grupo criado.
     */
    createGroup(group: Omit<Group, 'id'>): Promise<Group>;

    /**
     * Obtém todos os grupos dos quais um usuário é membro.
     * @param userId ID do usuário.
     * @returns Uma promessa com a lista de grupos.
     */
    getUserGroups(userId: string): Promise<Group[]>;

    /**
     * Obtém os detalhes de um grupo específico.
     * @param groupId ID do grupo.
     * @returns Uma promessa com o grupo encontrado ou null.
     */
    getGroupDetails(groupId: string): Promise<Group | null>;

    /**
     * Adiciona um membro a um grupo existente.
     * @param groupId ID do grupo.
     * @param userId ID do usuário a ser adicionado.
     * @returns Uma promessa vazia.
     */
    addMemberToGroup(groupId: string, userId: string): Promise<void>;
}
