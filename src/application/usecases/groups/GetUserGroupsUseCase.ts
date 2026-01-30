import { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import { Group } from '../../../domain/entities/Group';

/**
 * @class GetUserGroupsUseCase
 * Caso de uso responsável por recuperar os grupos de um usuário.
 */
export class GetUserGroupsUseCase {
    /**
     * Construtor do GetUserGroupsUseCase.
     * @param groupRepository Repositório de grupos.
     */
    constructor(private groupRepository: IGroupRepository) { }

    /**
     * Busca todos os grupos dos quais o usuário é membro.
     * @param userId ID do usuário.
     * @returns Uma promessa com a lista de grupos.
     */
    async execute(userId: string): Promise<Group[]> {
        return this.groupRepository.getUserGroups(userId);
    }
}
