import { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import { Group } from '../../../domain/entities/Group';

/**
 * @class CreateGroupUseCase
 * Caso de uso responsável pela criação de grupos de despesas.
 */
export class CreateGroupUseCase {
    /**
     * Construtor do CreateGroupUseCase.
     * @param groupRepository Repositório de grupos.
     */
    constructor(private groupRepository: IGroupRepository) { }

    /**
     * Executa a criação de um novo grupo.
     * @param name Nome do grupo.
     * @param userId ID do usuário criador.
     * @param description Descrição opcional do grupo.
     * @returns Uma promessa que resolve com o grupo criado.
     */
    async execute(name: string, userId: string, description?: string): Promise<Group> {
        return this.groupRepository.createGroup({
            name,
            description,
            createdBy: userId,
            members: [userId], // O criador é o primeiro membro
            createdAt: new Date(),
        });
    }
}
